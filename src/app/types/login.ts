export interface Login {
  client_id?: string,
  grant_type?: string,
  username: string,
  password: string,
  scope?: string
}

export interface Token {
  access_token: string,
  expires: number,
  token_type: string,
  user: string,
  username: string
}