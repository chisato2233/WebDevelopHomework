"""清理孤立的上传文件（未被任何需求或响应引用的文件）"""
import os
from collections import defaultdict
from django.core.management.base import BaseCommand
from django.conf import settings
from apps.needs.models import Need
from apps.responses.models import Response


class Command(BaseCommand):
    help = '清理未被引用的上传文件'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='仅显示将被删除的文件，不实际删除',
        )
        parser.add_argument(
            '--list',
            action='store_true',
            help='列出所有文件和对应的需求/响应',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        list_all = options['list']
        
        # 构建文件 URL 到需求/响应的映射
        file_to_refs = defaultdict(list)
        
        # 从 Need 模型收集
        for need in Need.objects.all():
            if need.images:
                for url in need.images:
                    title = f'{need.title[:20]}...' if len(need.title) > 20 else need.title
                    file_to_refs[url].append(f'需求#{need.id}: {title}')
            if need.videos:
                for url in need.videos:
                    title = f'{need.title[:20]}...' if len(need.title) > 20 else need.title
                    file_to_refs[url].append(f'需求#{need.id}: {title}')
        
        # 从 Response 模型收集
        for response in Response.objects.all():
            if response.images:
                for url in response.images:
                    file_to_refs[url].append(f'响应#{response.id} (需求#{response.need_id})')
            if response.videos:
                for url in response.videos:
                    file_to_refs[url].append(f'响应#{response.id} (需求#{response.need_id})')
        
        # 转换 URL 为相对路径
        referenced_paths = set()
        for url in file_to_refs.keys():
            if url.startswith('/media/'):
                referenced_paths.add(url[7:])  # 去掉 '/media/'
        
        # 遍历 media 目录中的文件
        media_root = settings.MEDIA_ROOT
        orphan_files = []
        all_files = []
        total_size = 0
        
        for root, dirs, files in os.walk(media_root):
            for filename in files:
                full_path = os.path.join(root, filename)
                relative_path = os.path.relpath(full_path, media_root)
                # 统一使用正斜杠（兼容 Windows）
                relative_path_normalized = relative_path.replace('\\', '/')
                
                # 跳过非图片/视频目录
                if not (relative_path_normalized.startswith('images/') or relative_path_normalized.startswith('videos/')):
                    continue
                
                url = f'/media/{relative_path_normalized}'
                file_size = os.path.getsize(full_path)
                all_files.append((relative_path_normalized, url, file_size, full_path))
                
                if relative_path_normalized not in referenced_paths:
                    orphan_files.append(full_path)
                    total_size += file_size
        
        # 如果请求列出所有文件
        if list_all:
            self.show_file_mapping(all_files, file_to_refs)
            return
        
        # 没有孤立文件时，显示文件映射
        if not orphan_files:
            self.show_file_mapping(all_files, file_to_refs)
            self.stdout.write(self.style.SUCCESS('\n所有文件都已被引用，没有孤立文件'))
            return
        
        # 显示将被删除的文件
        self.stdout.write(f'\n发现 {len(orphan_files)} 个孤立文件，共 {total_size / 1024 / 1024:.2f} MB:\n')
        for path in orphan_files[:20]:  # 最多显示 20 个
            self.stdout.write(self.style.WARNING(f'  - {path}'))
        if len(orphan_files) > 20:
            self.stdout.write(f'  ... 还有 {len(orphan_files) - 20} 个文件')
        
        if dry_run:
            self.stdout.write(self.style.WARNING('(--dry-run 模式，未实际删除)'))
            return
        
        # 删除文件
        deleted_count = 0
        for path in orphan_files:
            try:
                os.remove(path)
                deleted_count += 1
            except OSError as e:
                self.stdout.write(self.style.ERROR(f'删除失败: {path} - {e}'))
        
        # 清理空目录
        for root, dirs, files in os.walk(media_root, topdown=False):
            for dir_name in dirs:
                dir_path = os.path.join(root, dir_name)
                try:
                    if not os.listdir(dir_path):
                        os.rmdir(dir_path)
                except OSError:
                    pass
        
        self.stdout.write(self.style.SUCCESS(f'\n成功删除 {deleted_count} 个孤立文件'))
    
    def show_file_mapping(self, all_files, file_to_refs):
        """显示文件和需求/响应的对应关系"""
        if not all_files:
            self.stdout.write('\n没有上传的文件')
            return
        
        self.stdout.write(f'\n已上传文件列表 ({len(all_files)} 个):\n')
        self.stdout.write('-' * 80)
        
        for relative_path, url, file_size, _ in all_files:
            size_str = f'{file_size / 1024:.1f} KB' if file_size < 1024 * 1024 else f'{file_size / 1024 / 1024:.2f} MB'
            refs = file_to_refs.get(url, [])
            
            if refs:
                self.stdout.write(self.style.SUCCESS(f'\n  {relative_path} ({size_str})'))
                for ref in refs:
                    self.stdout.write(f'    -> {ref}')
            else:
                self.stdout.write(self.style.WARNING(f'\n  {relative_path} ({size_str})'))
                self.stdout.write(self.style.ERROR('    -> [孤立文件，未被引用]'))
        
        self.stdout.write('\n' + '-' * 80)
