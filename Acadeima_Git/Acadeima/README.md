# Acadeima — Gestão de Academia

Aplicação web para gerenciar alunos, planos, mensalidades, professores, fichas de treino e avaliações físicas. A interface é servida pelo próprio Spring Boot e usa a API REST da aplicação; os dados são armazenados em um banco H2 em arquivo.

## Requisitos

- Java 17 ou superior
- Maven 3.6+ (ou abra o `pom.xml` no IntelliJ IDEA e use o Maven integrado)

## Executar pelo IntelliJ IDEA

1. Abra a pasta do projeto (ou o `pom.xml`) no IntelliJ IDEA e aguarde a importação Maven.
2. Configure um JDK 17 em **File > Project Structure > Project SDK**.
3. Execute a configuração compartilhada **GestaoAcademiaApplication** na lista de configurações de execução, ou rode `GestaoAcademiaApplication.java`.
4. Acesse [http://localhost:8080](http://localhost:8080).

Pelo terminal, com Maven instalado:

```shell
mvn package
java -jar target/gestao-academia-1.0.0.jar
```

O banco local é criado em `data/academia.mv.db`. Na primeira inicialização, o sistema carrega exemplos de aluno, plano, professor, mensalidade pendente, treino e avaliação para facilitar a demonstração.

## Módulos e recursos

- **Alunos:** cadastro, consulta, edição e exclusão. Ao excluir um aluno, as mensalidades, fichas e avaliações relacionadas também são removidas.
- **Planos:** cadastro, consulta e edição; não permite excluir um plano vinculado a mensalidades.
- **Mensalidades:** cadastro, consulta, edição, exclusão e registro de pagamento, com situação e data de pagamento.
- **Professores:** cadastro, consulta, edição e exclusão; fichas existentes permanecem e deixam de referenciar o professor excluído.
- **Treinos:** criação, consulta, edição e exclusão de fichas associadas a alunos e, opcionalmente, professores.
- **Avaliações físicas:** registro e acompanhamento de medidas por aluno.

## API REST

Os endpoints são servidos em `/api`:

| Recurso | Endpoints principais |
| --- | --- |
| Resumo | `GET /api/resumo` |
| Alunos | `GET, POST /api/alunos`; `PUT, DELETE /api/alunos/{id}` |
| Planos | `GET, POST /api/planos`; `PUT, DELETE /api/planos/{id}` |
| Professores | `GET, POST /api/professores`; `PUT, DELETE /api/professores/{id}` |
| Mensalidades | `GET, POST /api/mensalidades`; `PUT, DELETE /api/mensalidades/{id}`; `PATCH /api/mensalidades/{id}/pagar` |
| Treinos | `GET, POST /api/treinos`; `PUT, DELETE /api/treinos/{id}` |
| Avaliações | `GET, POST /api/avaliacoes`; `PUT, DELETE /api/avaliacoes/{id}` |

A interface completa está em `src/main/resources/static`. O console H2 de desenvolvimento fica disponível em `/h2-console`, com JDBC URL `jdbc:h2:file:./data/academia`, usuário `sa` e senha em branco.
