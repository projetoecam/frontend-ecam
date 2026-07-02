import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  usuario = '';
  senha = '';
  mensagemErro = '';
  sucessoMensagem = '';
  private sucessoTimeout?: ReturnType<typeof setTimeout>;

  constructor(private authService: AuthService, private router: Router) {}

  fazerLogin() {
    this.mensagemErro = ''; 

    // Montando o objeto que o serviço agora espera
    const dadosLogin = { login: this.usuario, senha: this.senha };

    this.authService.login(dadosLogin).subscribe({
      next: (resposta: any) => { // Definido como 'any' para aceitar qualquer objeto
        console.log('Login com sucesso!', resposta);
        
        // Agora o TS entende que você está acessando a propriedade
        localStorage.setItem('token', resposta.token);
        localStorage.setItem('usuario', this.usuario);
        
        this.mensagemErro = '';
        this.sucessoMensagem = 'Login realizado com sucesso!';
        
        if (this.sucessoTimeout) clearTimeout(this.sucessoTimeout);
        
        this.sucessoTimeout = setTimeout(() => {
          this.sucessoMensagem = '';
          this.router.navigate(['/home']);
        }, 1000);
      },
      error: (erro) => {
        console.error('Erro no login', erro);
        this.mensagemErro = 'Usuário ou senha incorretos, ou erro no servidor.';
      }
    });
  }
}