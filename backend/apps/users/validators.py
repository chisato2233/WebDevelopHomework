from django.core.exceptions import ValidationError


def validate_password(password):
    """
    密码验证规则：
    - 不少于6位
    - 必须包含至少2个数字
    - 不能全部为大写或全部为小写
    """
    errors = []
    
    if len(password) < 6:
        errors.append('密码不少于6位')
    
    digit_count = sum(c.isdigit() for c in password)
    if digit_count < 2:
        errors.append('密码必须包含至少2个数字')
    
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    
    if password.isalpha():  # 全是字母
        if not (has_upper and has_lower):
            errors.append('密码不能全部为大写或全部为小写')
    
    if errors:
        raise ValidationError(errors)
    
    return password

