<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperação de Senha</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            width: 90%;
            margin: 20px auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .password-box {
            background-color: #f4f4f4;
            padding: 10px 15px;
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            border-radius: 4px;
            letter-spacing: 1px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Recuperação de Senha</h2>

        <p>Olá,</p>

        <p>Você solicitou uma redefinição de senha para sua conta. Para redefinir sua senha, clique no link abaixo:</p>

        <div class="password-box">
            <a href="{{ $resetLink }}">{{ $resetLink }}</a>
        </div>

        <p><strong>Importante:</strong> Se você não solicitou a redefinição de senha, por favor ignore este e-mail.</p>

        <p>Se você não solicitou isso, por favor, ignore este e-mail.</p>

        <p>Obrigado!</p>
    </div>
</body>
</html>