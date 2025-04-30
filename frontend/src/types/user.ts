// Tipos relacionados a usuários

// Interface para a requisição de atualização de senha
export interface UserPasswordUpdate {
  current_password: string;
  new_password: string;
}

// Poderíamos adicionar outros tipos aqui no futuro, como User, UserResponse, etc. 