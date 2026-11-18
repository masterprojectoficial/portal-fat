// Migrações do banco do Portal FAT, em ordem. Nunca editar uma migração já aplicada: criar a próxima.
module.exports = [
  {
    nome: '001_inicial',
    sql: [
      `CREATE TABLE IF NOT EXISTS usuarios (
        id CHAR(36) NOT NULL PRIMARY KEY,
        nome VARCHAR(120) NOT NULL,
        email VARCHAR(190) NOT NULL,
        papel ENUM('admin','executora','aprovadora') NOT NULL,
        senha_hash VARCHAR(255) NOT NULL,
        trocar_senha TINYINT(1) NOT NULL DEFAULT 1,
        ativo TINYINT(1) NOT NULL DEFAULT 1,
        falhas INT NOT NULL DEFAULT 0,
        bloqueado_ate DATETIME NULL,
        sessao_versao INT NOT NULL DEFAULT 1,
        ultimo_acesso DATETIME NULL,
        criado_em DATETIME NOT NULL DEFAULT (UTC_TIMESTAMP()),
        UNIQUE KEY uq_usuarios_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
      `CREATE TABLE IF NOT EXISTS conferencias (
        id CHAR(36) NOT NULL PRIMARY KEY,
        seq BIGINT NOT NULL AUTO_INCREMENT,
        frente ENUM('f1','f2') NOT NULL,
        rotina VARCHAR(20) NULL,
        competencia CHAR(7) NOT NULL,
        status ENUM('rascunho','em_aprovacao','devolvido','aprovado','descartada') NOT NULL,
        resultado LONGTEXT NOT NULL,
        arquivos TEXT NULL,
        decisoes LONGTEXT NULL,
        aval LONGTEXT NULL,
        fluxo LONGTEXT NULL,
        aprovador_previsto VARCHAR(120) NULL,
        versao INT NOT NULL DEFAULT 1,
        criado_por CHAR(36) NULL,
        criado_em DATETIME NOT NULL DEFAULT (UTC_TIMESTAMP()),
        atualizado_em DATETIME NOT NULL DEFAULT (UTC_TIMESTAMP()),
        UNIQUE KEY uq_conferencias_seq (seq),
        KEY ix_conferencias_frente_status (frente, status),
        KEY ix_conferencias_competencia (competencia),
        CONSTRAINT fk_conferencias_usuario FOREIGN KEY (criado_por) REFERENCES usuarios (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
      `CREATE TABLE IF NOT EXISTS relatorios (
        id CHAR(36) NOT NULL PRIMARY KEY,
        conferencia_id CHAR(36) NOT NULL,
        nome_arquivo VARCHAR(200) NOT NULL,
        html LONGTEXT NOT NULL,
        criado_em DATETIME NOT NULL DEFAULT (UTC_TIMESTAMP()),
        UNIQUE KEY uq_relatorios_conferencia (conferencia_id),
        CONSTRAINT fk_relatorios_conferencia FOREIGN KEY (conferencia_id) REFERENCES conferencias (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
      `CREATE TABLE IF NOT EXISTS historico (
        id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        em DATETIME NOT NULL DEFAULT (UTC_TIMESTAMP()),
        conferencia_id CHAR(36) NOT NULL,
        frente VARCHAR(60) NOT NULL,
        rotina VARCHAR(20) NULL,
        competencia CHAR(7) NOT NULL,
        status VARCHAR(20) NOT NULL,
        por VARCHAR(120) NOT NULL,
        usuario_id CHAR(36) NULL,
        resultado TEXT NULL,
        obs TEXT NULL,
        relatorio_id CHAR(36) NULL,
        arquivo VARCHAR(200) NULL,
        KEY ix_historico_em (em),
        KEY ix_historico_conferencia (conferencia_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
      `CREATE TABLE IF NOT EXISTS parametros (
        id TINYINT NOT NULL PRIMARY KEY,
        config LONGTEXT NOT NULL,
        atualizado_por CHAR(36) NULL,
        atualizado_em DATETIME NOT NULL DEFAULT (UTC_TIMESTAMP())
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
    ],
  },
  {
    nome: '002_perfil_ambos',
    sql: [
      "ALTER TABLE usuarios MODIFY papel ENUM('admin','executora','aprovadora','ambos') NOT NULL",
    ],
  },
];
