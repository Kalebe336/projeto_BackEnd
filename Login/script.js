document.getElementById('formCadastro').addEventListener('submit', function(event) {
    event.preventDefault(); 

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const confirmaSenha = document.getElementById('confirmaSenha').value;

    if (senha !== confirmaSenha) {
        alert('As senhas não coincidem!');
        return;
    }

    const usuarioCadastrado = {
        email: "admin@gmail.com",
        senha: "123456"
    };

    if (email === usuarioCadastrado.email && senha === usuarioCadastrado.senha) {
        alert('Login realizado com sucesso!');
        console.log('Usuário autenticado com sucesso:', { email });
        
        this.reset();
    } else {
        alert('E-mail ou senha incorretos!');
    }
});