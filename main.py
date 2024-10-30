from requests import Session

s = Session()
lines = s.get('https://rest-emtu.noxxonsat.com.br/rest/lineDetails?linha=285', verify=False).json()['linhas'][0]['veiculos']

print(lines)
