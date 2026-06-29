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

  constructor(private authService: AuthService, private router: Router) {}

  fazerLogin() {
    this.mensagemErro = ''; // Limpa os erros anteriores

    this.authService.login(this.usuario, this.senha).subscribe({
      next: (resposta) => {
        console.log('Login com sucesso!', resposta);
        // Salva o token no navegador
        localStorage.setItem('token', resposta.token);
        alert('Login realizado com sucesso! Token JWT salvo no navegador.');
      },
      error: (erro) => {
        console.error('Erro no login', erro);
        this.mensagemErro = 'Usuário ou senha incorretos, ou erro no servidor.';
      }
    });
  }
}