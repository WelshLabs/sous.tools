UPDATE auth.users SET
  confirmation_token = '',
  recovery_token = '',
  email_change_token_new = '',
  email_change = '',
  email_change_token_current = '',
  reauthentication_token = ''
WHERE email = 'conar@dtown.cafe';