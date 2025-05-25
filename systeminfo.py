import json
import os

def ler_package_json():
    if not os.path.exists("package.json"):
        print("Arquivo package.json não encontrado.")
        return None
    with open("package.json", "r", encoding="utf-8") as f:
        return json.load(f)

def mostrar_versao(pyproject):
    try:
        nome = pyproject["name"]
        versao = pyproject["version"]
        print(f"Pacote: {nome}, Versão atual: {versao}")
        return nome, versao
    except KeyError:
        print("Não foi possível encontrar nome ou versão no package.json.")
        return None, None

def incrementar_versao(versao, tipo):
    major, minor, patch = map(int, versao.split('.'))
    if tipo == "major":
        major += 1
        minor = 0
        patch = 0
    elif tipo == "minor":
        minor += 1
        patch = 0
    elif tipo == "patch":
        patch += 1
    else:
        print("Tipo de incremento inválido.")
        return versao
    return f"{major}.{minor}.{patch}"

def salvar_versao(pyproject, nova_versao):
    pyproject["version"] = nova_versao
    with open("package.json", "w", encoding="utf-8") as f:
        json.dump(pyproject, f, indent=2, ensure_ascii=False)
    print(f"Versão atualizada para: {nova_versao}")

def main():
    pyproject = ler_package_json()
    if not pyproject:
        return

    nome, versao = mostrar_versao(pyproject)
    if not versao:
        return

    tipo = input("Deseja incrementar a versão? (major/minor/patch/enter para não): ").strip().lower()
    if tipo in {"major", "minor", "patch"}:
        nova_versao = incrementar_versao(versao, tipo)
        salvar_versao(pyproject, nova_versao)

if __name__ == "__main__":
    main()