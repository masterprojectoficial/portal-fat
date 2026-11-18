/* Configuração padrão do Portal FAT - gerada a partir das planilhas de set/26. */
(function (root) {
  root.FAT = root.FAT || {};
  root.FAT.DEFAULT_CONFIG = {
    "versao": "2026-11-17",
    "filiais": {
      "010101": "Salvador",
      "020101": "Unece",
      "060101": "Itumbiara",
      "070101": "Pouso Alegre",
      "090101": "Araguari"
    },
    "unidadeFilial": {
      "04": "010101",
      "05": "010101",
      "08": "020101",
      "10": "060101",
      "60": "070101",
      "65": "090101"
    },
    "loteIntegracao": "008888",
    "centroCustoMedicina": "1.2.8.307",
    "cursoMedicina": "Medicina",
    "tiposOperacao": [
      {
        "codigo": "1",
        "descricao": "Cobrança de Mensalidade",
        "tipo": "Faturamento"
      },
      {
        "codigo": "2",
        "descricao": "Bolsa Incondicional",
        "tipo": "Faturamento"
      },
      {
        "codigo": "3",
        "descricao": "Bolsa/Desconto Condicional",
        "tipo": "Baixa"
      },
      {
        "codigo": "4",
        "descricao": "Cobrança de Serviço",
        "tipo": "Faturamento"
      },
      {
        "codigo": "5",
        "descricao": "Contratação de serviço",
        "tipo": "Faturamento"
      },
      {
        "codigo": "9",
        "descricao": "Emissão de NFSe",
        "tipo": "Faturamento"
      },
      {
        "codigo": "12",
        "descricao": "Baixa por Acordo",
        "tipo": "Baixa"
      },
      {
        "codigo": "16",
        "descricao": "Baixa por Recebimento",
        "tipo": "Baixa"
      },
      {
        "codigo": "17",
        "descricao": "Baixa de Encargo por Recebimento",
        "tipo": "Baixa"
      },
      {
        "codigo": "18",
        "descricao": "Baixa por Desconto",
        "tipo": "Baixa"
      },
      {
        "codigo": "23",
        "descricao": "Recebimento a Maior",
        "tipo": "Baixa"
      },
      {
        "codigo": "24",
        "descricao": "Baixa por Compensação (cobrança anterior maior)",
        "tipo": "Baixa"
      },
      {
        "codigo": "25",
        "descricao": "Baixa por Outros Acertos",
        "tipo": "Baixa"
      },
      {
        "codigo": "26",
        "descricao": "Devolução para o Aluno",
        "tipo": "Baixa"
      },
      {
        "codigo": "27",
        "descricao": "Compensação em Outra Cobrança (cobrança maior)",
        "tipo": "Baixa"
      },
      {
        "codigo": "28",
        "descricao": "Cobrança de Acordo",
        "tipo": "Faturamento"
      },
      {
        "codigo": "30",
        "descricao": "Cobrança de Financiamento",
        "tipo": "Faturamento"
      },
      {
        "codigo": "31",
        "descricao": "Cobrança de Cheque Devolvido",
        "tipo": "Faturamento"
      },
      {
        "codigo": "32",
        "descricao": "Cobrança de Outras Dívidas",
        "tipo": "Faturamento"
      },
      {
        "codigo": "33",
        "descricao": "Desconto na Dívida",
        "tipo": "Faturamento"
      },
      {
        "codigo": "34",
        "descricao": "Baixa por Financiamento",
        "tipo": "Baixa"
      },
      {
        "codigo": "35",
        "descricao": "Baixa por Arrasto",
        "tipo": "Baixa"
      },
      {
        "codigo": "36",
        "descricao": "Cobrança de Dívida Arrastada",
        "tipo": "Faturamento"
      },
      {
        "codigo": "45",
        "descricao": "Baixa por Arrasto (Saldo Aberto)",
        "tipo": "Baixa"
      },
      {
        "codigo": "46",
        "descricao": "Baixa de Encargo por Arrasto (Saldo Aberto)",
        "tipo": "Baixa"
      },
      {
        "codigo": "47",
        "descricao": "Cobrança de Dívida Arrastada (Saldo Aberto)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "49",
        "descricao": "Reconhecimento de Adiantamento de Recebimento",
        "tipo": "Faturamento"
      },
      {
        "codigo": "50",
        "descricao": "Baixa por Compensação (pagamento a maior)",
        "tipo": "Baixa"
      },
      {
        "codigo": "51",
        "descricao": "Compensação em Outra Cobrança (pagamento a maior)",
        "tipo": "Baixa"
      },
      {
        "codigo": "53",
        "descricao": "Devolução Retida",
        "tipo": "Faturamento"
      },
      {
        "codigo": "54",
        "descricao": "Cobranca de Encargo",
        "tipo": "Baixa"
      },
      {
        "codigo": "55",
        "descricao": "Cobrança de Acordo (Encargo Dívida Original)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "56",
        "descricao": "Cobrança de Acordo (Desconto Dívida Original)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "57",
        "descricao": "Perda de Bolsa/Desconto Condicional",
        "tipo": "Baixa"
      },
      {
        "codigo": "59",
        "descricao": "Baixa de Encargo por Desconto",
        "tipo": "Baixa"
      },
      {
        "codigo": "60",
        "descricao": "Baixa de Encargo por Acordo",
        "tipo": "Baixa"
      },
      {
        "codigo": "61",
        "descricao": "Baixa de Encargo por Financiamento",
        "tipo": "Baixa"
      },
      {
        "codigo": "62",
        "descricao": "Baixa de Encargo por Arrasto",
        "tipo": "Baixa"
      },
      {
        "codigo": "63",
        "descricao": "Desconto a Maior",
        "tipo": "Baixa"
      },
      {
        "codigo": "64",
        "descricao": "Crédito Disponível (Diferenca a Maior)",
        "tipo": "Baixa"
      },
      {
        "codigo": "65",
        "descricao": "Depósito Não Identificado (DNI)",
        "tipo": "Não contabiliza"
      },
      {
        "codigo": "66",
        "descricao": "Crédito Disponível (Bolsa Incond a Maior)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "67",
        "descricao": "Crédito Disponível (Bolsa Cond a Maior)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "68",
        "descricao": "Crédito Disponível (Desconto a Maior)",
        "tipo": "Baixa"
      },
      {
        "codigo": "70",
        "descricao": "Recebimento de Processo Seletivo",
        "tipo": "Não contabiliza"
      },
      {
        "codigo": "71",
        "descricao": "Alteracao de Vencimento de Cobranca",
        "tipo": "Não contabiliza"
      },
      {
        "codigo": "75",
        "descricao": "Parcela de Cartão de Crédito A Receber",
        "tipo": "Não contabiliza"
      },
      {
        "codigo": "76",
        "descricao": "Baixa de Parcela de Cartão de Crédito",
        "tipo": "Não contabiliza"
      },
      {
        "codigo": "77",
        "descricao": "Taxa de Cartão de Crédito",
        "tipo": "Não contabiliza"
      },
      {
        "codigo": "80",
        "descricao": "Provisão de Dívida Duvidosa",
        "tipo": "Faturamento"
      },
      {
        "codigo": "81",
        "descricao": "Perda de Recebimento de Crédito",
        "tipo": "Baixa"
      },
      {
        "codigo": "82",
        "descricao": "Cheque Cadastrado",
        "tipo": "Baixa"
      },
      {
        "codigo": "83",
        "descricao": "Cheque Apresentado 1a Vez",
        "tipo": "Baixa"
      },
      {
        "codigo": "84",
        "descricao": "Cheque Devolvido 1a Vez",
        "tipo": "Baixa"
      },
      {
        "codigo": "85",
        "descricao": "Cheque Apresentado 2a Vez",
        "tipo": "Baixa"
      },
      {
        "codigo": "86",
        "descricao": "Cheque Devolvido 2a Vez",
        "tipo": "Baixa"
      },
      {
        "codigo": "87",
        "descricao": "Cheque Cancelado",
        "tipo": "Baixa"
      },
      {
        "codigo": "88",
        "descricao": "Cheque Baixado",
        "tipo": "Baixa"
      },
      {
        "codigo": "90",
        "descricao": "Emissao de Nota Fiscal",
        "tipo": "Não contabiliza"
      },
      {
        "codigo": "91",
        "descricao": "Nota Fiscal (Imposto)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "92",
        "descricao": "Nota Fiscal (Valor de Serviço)",
        "tipo": "Não contabiliza"
      },
      {
        "codigo": "93",
        "descricao": "Nota Fiscal (Valor de Desconto Incondicional)",
        "tipo": "Não contabiliza"
      },
      {
        "codigo": "94",
        "descricao": "Provisão de Serviço Contratado",
        "tipo": "Faturamento"
      },
      {
        "codigo": "95",
        "descricao": "Redução de Provisão de Serviço Contratado",
        "tipo": "Faturamento"
      },
      {
        "codigo": "96",
        "descricao": "Provisão de Desconto em Serviço Contratado",
        "tipo": "Faturamento"
      },
      {
        "codigo": "97",
        "descricao": "Redução de Provisão de Desconto em Serviço Contratado",
        "tipo": "Faturamento"
      },
      {
        "codigo": "98",
        "descricao": "Provisão de Bolsa em Serviço Contratado",
        "tipo": "Faturamento"
      },
      {
        "codigo": "99",
        "descricao": "Redução de Provisão de Bolsa em Serviço Contratado",
        "tipo": "Faturamento"
      },
      {
        "codigo": "301",
        "descricao": "Cancelamento de Cobrança de Mensalidade",
        "tipo": "Faturamento"
      },
      {
        "codigo": "302",
        "descricao": "Cancelamento de Bolsa Incondicional",
        "tipo": "Faturamento"
      },
      {
        "codigo": "303",
        "descricao": "Cancelamento de Bolsa/Desconto Condicional",
        "tipo": "Baixa"
      },
      {
        "codigo": "304",
        "descricao": "Cancelamento de Cobrança de Serviço",
        "tipo": "Faturamento"
      },
      {
        "codigo": "305",
        "descricao": "Cancelamento de Contratação de serviço",
        "tipo": "Faturamento"
      },
      {
        "codigo": "309",
        "descricao": "Cancelamento de Emissão de NFSe",
        "tipo": "Faturamento"
      },
      {
        "codigo": "312",
        "descricao": "Cancelamento de Baixa por Acordo",
        "tipo": "Baixa"
      },
      {
        "codigo": "316",
        "descricao": "Cancelamento de Baixa por Recebimento",
        "tipo": "Baixa"
      },
      {
        "codigo": "317",
        "descricao": "Cancelamento de Baixa de Encargo por Recebimento",
        "tipo": "Baixa"
      },
      {
        "codigo": "318",
        "descricao": "Cancelamento de Baixa por Desconto",
        "tipo": "Baixa"
      },
      {
        "codigo": "323",
        "descricao": "Cancelamento de Recebimento a Maior",
        "tipo": "Baixa"
      },
      {
        "codigo": "324",
        "descricao": "Cancelamento de Baixa por Compensação (cobrança anterior maior)",
        "tipo": "Baixa"
      },
      {
        "codigo": "325",
        "descricao": "Cancelamento de Baixa por Outros Acertos",
        "tipo": "Baixa"
      },
      {
        "codigo": "326",
        "descricao": "Cancelamento de Devolução para o Aluno",
        "tipo": "Baixa"
      },
      {
        "codigo": "327",
        "descricao": "Cancelamento de Compensação em Outra Cobrança (cobrança maior)",
        "tipo": "Baixa"
      },
      {
        "codigo": "328",
        "descricao": "Cancelamento de Cobrança de Acordo",
        "tipo": "Faturamento"
      },
      {
        "codigo": "330",
        "descricao": "Cancelamento de Cobrança de Financiamento",
        "tipo": "Faturamento"
      },
      {
        "codigo": "331",
        "descricao": "Cancelamento de Cobrança de Cheque Devolvido",
        "tipo": "Faturamento"
      },
      {
        "codigo": "332",
        "descricao": "Cancelamento de Cobrança de Outras Dívidas",
        "tipo": "Faturamento"
      },
      {
        "codigo": "333",
        "descricao": "Cancelamento de Desconto na Dívida",
        "tipo": "Faturamento"
      },
      {
        "codigo": "334",
        "descricao": "Cancelamento de Baixa por Financiamento",
        "tipo": "Baixa"
      },
      {
        "codigo": "335",
        "descricao": "Cancelamento de Baixa por Arrasto",
        "tipo": "Baixa"
      },
      {
        "codigo": "336",
        "descricao": "Cancelamento de Cobrança de Dívida Arrastada",
        "tipo": "Faturamento"
      },
      {
        "codigo": "345",
        "descricao": "Cancelamento de Baixa por Arrasto (Saldo Aberto)",
        "tipo": "Baixa"
      },
      {
        "codigo": "346",
        "descricao": "Cancelamento de Baixa de Encargo por Arrasto (Saldo Aberto)",
        "tipo": "Baixa"
      },
      {
        "codigo": "347",
        "descricao": "Cancelamento de Cobrança de Dívida Arrastada (Saldo Aberto)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "349",
        "descricao": "Cancelamento de Reconhecimento de Adiantamento de Recebimento",
        "tipo": "Faturamento"
      },
      {
        "codigo": "350",
        "descricao": "Cancelamento de Baixa por Compensação (pagamento a maior)",
        "tipo": "Baixa"
      },
      {
        "codigo": "351",
        "descricao": "Cancelamento de Compensação em Outra Cobrança (pagamento a maior)",
        "tipo": "Baixa"
      },
      {
        "codigo": "353",
        "descricao": "Cancelamento de Devolução Retida",
        "tipo": "Faturamento"
      },
      {
        "codigo": "354",
        "descricao": "Cancelamento de Cobranca de Encargo",
        "tipo": "Baixa"
      },
      {
        "codigo": "355",
        "descricao": "Cancelamento de Cobrança de Acordo (Encargo Dívida Original)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "356",
        "descricao": "Cancelamento de Cobrança de Acordo (Desconto Dívida Original)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "357",
        "descricao": "Cancelamento de Perda de Bolsa/Desconto Condicional",
        "tipo": "Baixa"
      },
      {
        "codigo": "359",
        "descricao": "Cancelamento de Baixa de Encargo por Desconto",
        "tipo": "Baixa"
      },
      {
        "codigo": "360",
        "descricao": "Cancelamento de Baixa de Encargo por Acordo",
        "tipo": "Baixa"
      },
      {
        "codigo": "361",
        "descricao": "Cancelamento de Baixa de Encargo por Financiamento",
        "tipo": "Baixa"
      },
      {
        "codigo": "362",
        "descricao": "Cancelamento de Baixa de Encargo por Arrasto",
        "tipo": "Baixa"
      },
      {
        "codigo": "363",
        "descricao": "Cancelamento de Desconto a Maior",
        "tipo": "Baixa"
      },
      {
        "codigo": "364",
        "descricao": "Cancelamento de Crédito Disponível (Diferenca a Maior)",
        "tipo": "Baixa"
      },
      {
        "codigo": "365",
        "descricao": "Cancelamento de Depósito Não Identificado (DNI)",
        "tipo": "Baixa"
      },
      {
        "codigo": "366",
        "descricao": "Cancelamento de Crédito Disponível (Bolsa Incond a Maior)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "367",
        "descricao": "Cancelamento de Crédito Disponível (Bolsa Cond a Maior)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "368",
        "descricao": "Cancelamento de Crédito Disponível (Desconto a Maior)",
        "tipo": "Baixa"
      },
      {
        "codigo": "370",
        "descricao": "Cancelamento de Recebimento de Processo Seletivo",
        "tipo": "Baixa"
      },
      {
        "codigo": "371",
        "descricao": "Cancelamento de Alteracao de Vencimento de Cobranca",
        "tipo": "Faturamento"
      },
      {
        "codigo": "375",
        "descricao": "Cancelamento de Parcela de Cartão de Crédito A Receber",
        "tipo": "Baixa"
      },
      {
        "codigo": "376",
        "descricao": "Cancelamento de Baixa de Parcela de Cartão de Crédito",
        "tipo": "Baixa"
      },
      {
        "codigo": "377",
        "descricao": "Cancelamento de Taxa de Cartão de Crédito",
        "tipo": "Baixa"
      },
      {
        "codigo": "380",
        "descricao": "Cancelamento de Provisão de Dívida Duvidosa",
        "tipo": "Faturamento"
      },
      {
        "codigo": "381",
        "descricao": "Cancelamento de Perda de Recebimento de Crédito",
        "tipo": "Baixa"
      },
      {
        "codigo": "382",
        "descricao": "Cancelamento de Cheque Cadastrado",
        "tipo": "Baixa"
      },
      {
        "codigo": "383",
        "descricao": "Cancelamento de Cheque Apresentado 1a Vez",
        "tipo": "Baixa"
      },
      {
        "codigo": "384",
        "descricao": "Cancelamento de Cheque Devolvido 1a Vez",
        "tipo": "Baixa"
      },
      {
        "codigo": "385",
        "descricao": "Cancelamento de Cheque Apresentado 2a Vez",
        "tipo": "Baixa"
      },
      {
        "codigo": "386",
        "descricao": "Cancelamento de Cheque Devolvido 2a Vez",
        "tipo": "Baixa"
      },
      {
        "codigo": "387",
        "descricao": "Cancelamento de Cheque Cancelado",
        "tipo": "Baixa"
      },
      {
        "codigo": "388",
        "descricao": "Cancelamento de Cheque Baixado",
        "tipo": "Baixa"
      },
      {
        "codigo": "392",
        "descricao": "Cancelamento de Nota Fiscal (Valor de Serviço)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "393",
        "descricao": "Cancelamento de Nota Fiscal (Valor de Desconto Incondicional)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "501",
        "descricao": "Apropriação de Serviço Prestado",
        "tipo": "Faturamento"
      },
      {
        "codigo": "502",
        "descricao": "Bolsa (Aprop Serv)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "525",
        "descricao": "Outros Acertos (Aprop Serv)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "533",
        "descricao": "Desconto (Aprop Serv)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "572",
        "descricao": "Baixa Automática (Aprop Serv)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "573",
        "descricao": "Baixa Automática Positiva (Aprop Serv)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "801",
        "descricao": "Cancelamento de Apropriação de Serviço Prestado",
        "tipo": "Faturamento"
      },
      {
        "codigo": "802",
        "descricao": "Cancelamento de Bolsa (Aprop Serv)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "825",
        "descricao": "Cancelamento de Outros Acertos (Aprop Serv)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "833",
        "descricao": "Cancelamento de Desconto (Aprop Serv)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "872",
        "descricao": "Cancelamento de Baixa Automática (Aprop Serv)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "873",
        "descricao": "Cancelamento de Baixa Automática Positiva (Aprop Serv)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1001",
        "descricao": "Estorno de Cobrança de Mensalidade",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1002",
        "descricao": "Estorno de Bolsa Incondicional",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1003",
        "descricao": "Estorno de Bolsa/Desconto Condicional",
        "tipo": "Baixa"
      },
      {
        "codigo": "1004",
        "descricao": "Estorno de Cobrança de Serviço",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1005",
        "descricao": "Estorno de Contratação de serviço",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1009",
        "descricao": "Estorno de Emissão de NFSe",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1012",
        "descricao": "Estorno de Baixa por Acordo",
        "tipo": "Baixa"
      },
      {
        "codigo": "1016",
        "descricao": "Estorno de Baixa por Recebimento",
        "tipo": "Baixa"
      },
      {
        "codigo": "1017",
        "descricao": "Estorno de Baixa de Encargo por Recebimento",
        "tipo": "Baixa"
      },
      {
        "codigo": "1018",
        "descricao": "Estorno de Baixa por Desconto",
        "tipo": "Baixa"
      },
      {
        "codigo": "1023",
        "descricao": "Estorno de Recebimento a Maior",
        "tipo": "Baixa"
      },
      {
        "codigo": "1024",
        "descricao": "Estorno de Baixa por Compensação (cobrança anterior maior)",
        "tipo": "Baixa"
      },
      {
        "codigo": "1025",
        "descricao": "Estorno de Baixa por Outros Acertos",
        "tipo": "Baixa"
      },
      {
        "codigo": "1026",
        "descricao": "Estorno de Devolução para o Aluno",
        "tipo": "Baixa"
      },
      {
        "codigo": "1027",
        "descricao": "Estorno de Compensação em Outra Cobrança (cobrança maior)",
        "tipo": "Baixa"
      },
      {
        "codigo": "1028",
        "descricao": "Estorno de Cobrança de Acordo",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1030",
        "descricao": "Estorno de Cobrança de Financiamento",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1031",
        "descricao": "Estorno de Cobrança de Cheque Devolvido",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1032",
        "descricao": "Estorno de Cobrança de Outras Dívidas",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1033",
        "descricao": "Estorno de Desconto na Dívida",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1034",
        "descricao": "Estorno de Baixa por Financiamento",
        "tipo": "Baixa"
      },
      {
        "codigo": "1035",
        "descricao": "Estorno de Baixa por Arrasto",
        "tipo": "Baixa"
      },
      {
        "codigo": "1036",
        "descricao": "Estorno de Cobrança de Dívida Arrastada",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1045",
        "descricao": "Estorno de Baixa por Arrasto (Saldo Aberto)",
        "tipo": "Baixa"
      },
      {
        "codigo": "1046",
        "descricao": "Estorno de Baixa de Encargo por Arrasto (Saldo Aberto)",
        "tipo": "Baixa"
      },
      {
        "codigo": "1047",
        "descricao": "Estorno de Cobrança de Dívida Arrastada (Saldo Aberto)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1049",
        "descricao": "Estorno de Reconhecimento de Adiantamento de Recebimento",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1050",
        "descricao": "Estorno de Baixa por Compensação (pagamento a maior)",
        "tipo": "Baixa"
      },
      {
        "codigo": "1051",
        "descricao": "Estorno de Compensação em Outra Cobrança (pagamento a maior)",
        "tipo": "Baixa"
      },
      {
        "codigo": "1053",
        "descricao": "Estorno de Devolução Retida",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1054",
        "descricao": "Estorno de Cobranca de Encargo",
        "tipo": "Baixa"
      },
      {
        "codigo": "1055",
        "descricao": "Estorno de Cobrança de Acordo (Encargo Dívida Original)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1056",
        "descricao": "Estorno de Cobrança de Acordo (Desconto Dívida Original)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1057",
        "descricao": "Estorno de Perda de Bolsa/Desconto Condicional",
        "tipo": "Baixa"
      },
      {
        "codigo": "1059",
        "descricao": "Estorno de Baixa de Encargo por Desconto",
        "tipo": "Baixa"
      },
      {
        "codigo": "1060",
        "descricao": "Estorno de Baixa de Encargo por Acordo",
        "tipo": "Baixa"
      },
      {
        "codigo": "1061",
        "descricao": "Estorno de Baixa de Encargo por Financiamento",
        "tipo": "Baixa"
      },
      {
        "codigo": "1062",
        "descricao": "Estorno de Baixa de Encargo por Arrasto",
        "tipo": "Baixa"
      },
      {
        "codigo": "1063",
        "descricao": "Estorno de Desconto a Maior",
        "tipo": "Baixa"
      },
      {
        "codigo": "1064",
        "descricao": "Estorno de Crédito Disponível (Diferenca a Maior)",
        "tipo": "Baixa"
      },
      {
        "codigo": "1065",
        "descricao": "Estorno de Depósito Não Identificado (DNI)",
        "tipo": "Baixa"
      },
      {
        "codigo": "1066",
        "descricao": "Estorno de Crédito Disponível (Bolsa Incond a Maior)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1067",
        "descricao": "Estorno de Crédito Disponível (Bolsa Cond a Maior)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1068",
        "descricao": "Estorno de Crédito Disponível (Desconto a Maior)",
        "tipo": "Baixa"
      },
      {
        "codigo": "1070",
        "descricao": "Estorno de Recebimento de Processo Seletivo",
        "tipo": "Baixa"
      },
      {
        "codigo": "1071",
        "descricao": "Estorno de Alteracao de Vencimento de Cobranca",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1075",
        "descricao": "Estorno de Parcela de Cartão de Crédito A Receber",
        "tipo": "Baixa"
      },
      {
        "codigo": "1077",
        "descricao": "Estorno de Taxa de Cartão de Crédito",
        "tipo": "Baixa"
      },
      {
        "codigo": "1080",
        "descricao": "Estorno de Provisão de Dívida Duvidosa",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1081",
        "descricao": "Estorno de Perda de Recebimento de Crédito",
        "tipo": "Baixa"
      },
      {
        "codigo": "1082",
        "descricao": "Estorno de Cheque Cadastrado",
        "tipo": "Baixa"
      },
      {
        "codigo": "1083",
        "descricao": "Estorno de Cheque Apresentado 1a Vez",
        "tipo": "Baixa"
      },
      {
        "codigo": "1084",
        "descricao": "Estorno de Cheque Devolvido 1a Vez",
        "tipo": "Baixa"
      },
      {
        "codigo": "1085",
        "descricao": "Estorno de Cheque Apresentado 2a Vez",
        "tipo": "Baixa"
      },
      {
        "codigo": "1086",
        "descricao": "Estorno de Cheque Devolvido 2a Vez",
        "tipo": "Baixa"
      },
      {
        "codigo": "1087",
        "descricao": "Estorno de Cheque Cancelado",
        "tipo": "Baixa"
      },
      {
        "codigo": "1088",
        "descricao": "Estorno de Cheque Baixado",
        "tipo": "Baixa"
      },
      {
        "codigo": "1090",
        "descricao": "Estorno de Emissao de Nota Fiscal",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1091",
        "descricao": "Estorno de Nota Fiscal (Imposto)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1092",
        "descricao": "Estorno de Nota Fiscal (Valor de Serviço)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1093",
        "descricao": "Estorno de Nota Fiscal (Valor de Desconto Incondicional)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1094",
        "descricao": "Estorno de Provisão de Serviço Contratado",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1095",
        "descricao": "Estorno de Redução de Provisão de Serviço Contratado",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1096",
        "descricao": "Estorno de Provisão de Desconto em Serviço Contratado",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1097",
        "descricao": "Estorno de Redução de Provisão de Desconto em Serviço Contratado",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1098",
        "descricao": "Estorno de Provisão de Bolsa em Serviço Contratado",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1099",
        "descricao": "Estorno de Redução de Provisão de Bolsa em Serviço Contratado",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1301",
        "descricao": "Estorno de Cancelamento de Cobrança de Mensalidade",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1302",
        "descricao": "Estorno de Cancelamento de Bolsa Incondicional",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1303",
        "descricao": "Estorno de Cancelamento de Bolsa/Desconto Condicional",
        "tipo": "Baixa"
      },
      {
        "codigo": "1304",
        "descricao": "Estorno de Cancelamento de Cobrança de Serviço",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1305",
        "descricao": "Estorno de Cancelamento de Contratação de serviço",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1309",
        "descricao": "Estorno de Cancelamento de Emissão de NFSe",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1312",
        "descricao": "Estorno de Cancelamento de Baixa por Acordo",
        "tipo": "Baixa"
      },
      {
        "codigo": "1316",
        "descricao": "Estorno de Cancelamento de Baixa por Recebimento",
        "tipo": "Baixa"
      },
      {
        "codigo": "1317",
        "descricao": "Estorno de Cancelamento de Baixa de Encargo por Recebimento",
        "tipo": "Baixa"
      },
      {
        "codigo": "1318",
        "descricao": "Estorno de Cancelamento de Baixa por Desconto",
        "tipo": "Baixa"
      },
      {
        "codigo": "1323",
        "descricao": "Estorno de Cancelamento de Recebimento a Maior",
        "tipo": "Baixa"
      },
      {
        "codigo": "1324",
        "descricao": "Estorno de Cancelamento de Baixa por Compensação (cobrança anterior maior)",
        "tipo": "Baixa"
      },
      {
        "codigo": "1325",
        "descricao": "Estorno de Cancelamento de Baixa por Outros Acertos",
        "tipo": "Baixa"
      },
      {
        "codigo": "1326",
        "descricao": "Estorno de Cancelamento de Devolução para o Aluno",
        "tipo": "Baixa"
      },
      {
        "codigo": "1327",
        "descricao": "Estorno de Cancelamento de Compensação em Outra Cobrança (cobrança maior)",
        "tipo": "Baixa"
      },
      {
        "codigo": "1328",
        "descricao": "Estorno de Cancelamento de Cobrança de Acordo",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1330",
        "descricao": "Estorno de Cancelamento de Cobrança de Financiamento",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1331",
        "descricao": "Estorno de Cancelamento de Cobrança de Cheque Devolvido",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1332",
        "descricao": "Estorno de Cancelamento de Cobrança de Outras Dívidas",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1333",
        "descricao": "Estorno de Cancelamento de Desconto na Dívida",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1334",
        "descricao": "Estorno de Cancelamento de Baixa por Financiamento",
        "tipo": "Baixa"
      },
      {
        "codigo": "1335",
        "descricao": "Estorno de Cancelamento de Baixa por Arrasto",
        "tipo": "Baixa"
      },
      {
        "codigo": "1336",
        "descricao": "Estorno de Cancelamento de Cobrança de Dívida Arrastada",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1345",
        "descricao": "Estorno de Cancelamento de Baixa por Arrasto (Saldo Aberto)",
        "tipo": "Baixa"
      },
      {
        "codigo": "1346",
        "descricao": "Estorno de Cancelamento de Baixa de Encargo por Arrasto (Saldo Aberto)",
        "tipo": "Baixa"
      },
      {
        "codigo": "1347",
        "descricao": "Estorno de Cancelamento de Cobrança de Dívida Arrastada (Saldo Aberto)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1349",
        "descricao": "Estorno de Cancelamento de Reconhecimento de Adiantamento de Recebimento",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1350",
        "descricao": "Estorno de Cancelamento de Baixa por Compensação (pagamento a maior)",
        "tipo": "Baixa"
      },
      {
        "codigo": "1351",
        "descricao": "Estorno de Cancelamento de Compensação em Outra Cobrança (pagamento a maior)",
        "tipo": "Baixa"
      },
      {
        "codigo": "1353",
        "descricao": "Estorno de Cancelamento de Devolução Retida",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1354",
        "descricao": "Estorno de Cancelamento de Cobranca de Encargo",
        "tipo": "Baixa"
      },
      {
        "codigo": "1355",
        "descricao": "Estorno de Cancelamento de Cobrança de Acordo (Encargo Dívida Original)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1356",
        "descricao": "Estorno de Cancelamento de Cobrança de Acordo (Desconto Dívida Original)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1357",
        "descricao": "Estorno de Cancelamento de Perda de Bolsa/Desconto Condicional",
        "tipo": "Baixa"
      },
      {
        "codigo": "1359",
        "descricao": "Estorno de Cancelamento de Baixa de Encargo por Desconto",
        "tipo": "Baixa"
      },
      {
        "codigo": "1360",
        "descricao": "Estorno de Cancelamento de Baixa de Encargo por Acordo",
        "tipo": "Baixa"
      },
      {
        "codigo": "1361",
        "descricao": "Estorno de Cancelamento de Baixa de Encargo por Financiamento",
        "tipo": "Baixa"
      },
      {
        "codigo": "1362",
        "descricao": "Estorno de Cancelamento de Baixa de Encargo por Arrasto",
        "tipo": "Baixa"
      },
      {
        "codigo": "1363",
        "descricao": "Estorno de Cancelamento de Desconto a Maior",
        "tipo": "Baixa"
      },
      {
        "codigo": "1364",
        "descricao": "Estorno de Cancelamento de Crédito Disponível (Diferenca a Maior)",
        "tipo": "Baixa"
      },
      {
        "codigo": "1365",
        "descricao": "Estorno de Cancelamento de Depósito Não Identificado (DNI)",
        "tipo": "Baixa"
      },
      {
        "codigo": "1366",
        "descricao": "Estorno de Cancelamento de Crédito Disponível (Bolsa Incond a Maior)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1367",
        "descricao": "Estorno de Cancelamento de Crédito Disponível (Bolsa Cond a Maior)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1368",
        "descricao": "Estorno de Cancelamento de Crédito Disponível (Desconto a Maior)",
        "tipo": "Baixa"
      },
      {
        "codigo": "1370",
        "descricao": "Estorno de Cancelamento de Recebimento de Processo Seletivo",
        "tipo": "Baixa"
      },
      {
        "codigo": "1371",
        "descricao": "Estorno de Cancelamento de Alteracao de Vencimento de Cobranca",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1375",
        "descricao": "Estorno de Cancelamento de Parcela de Cartão de Crédito A Receber",
        "tipo": "Baixa"
      },
      {
        "codigo": "1377",
        "descricao": "Estorno de Cancelamento de Taxa de Cartão de Crédito",
        "tipo": "Baixa"
      },
      {
        "codigo": "1380",
        "descricao": "Estorno de Cancelamento de Provisão de Dívida Duvidosa",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1381",
        "descricao": "Estorno de Cancelamento de Perda de Recebimento de Crédito",
        "tipo": "Baixa"
      },
      {
        "codigo": "1382",
        "descricao": "Estorno de Cancelamento de Cheque Cadastrado",
        "tipo": "Baixa"
      },
      {
        "codigo": "1383",
        "descricao": "Estorno de Cancelamento de Cheque Apresentado 1a Vez",
        "tipo": "Baixa"
      },
      {
        "codigo": "1384",
        "descricao": "Estorno de Cancelamento de Cheque Devolvido 1a Vez",
        "tipo": "Baixa"
      },
      {
        "codigo": "1385",
        "descricao": "Estorno de Cancelamento de Cheque Apresentado 2a Vez",
        "tipo": "Baixa"
      },
      {
        "codigo": "1386",
        "descricao": "Estorno de Cancelamento de Cheque Devolvido 2a Vez",
        "tipo": "Baixa"
      },
      {
        "codigo": "1387",
        "descricao": "Estorno de Cancelamento de Cheque Cancelado",
        "tipo": "Baixa"
      },
      {
        "codigo": "1388",
        "descricao": "Estorno de Cancelamento de Cheque Baixado",
        "tipo": "Baixa"
      },
      {
        "codigo": "1392",
        "descricao": "Estorno de Cancelamento de Nota Fiscal (Valor de Serviço)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1393",
        "descricao": "Estorno de Cancelamento de Nota Fiscal (Valor de Desconto Incondicional)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1501",
        "descricao": "Estorno de Apropriação de Serviço Prestado",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1502",
        "descricao": "Estorno de Bolsa (Aprop Serv)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1525",
        "descricao": "Estorno de Outros Acertos (Aprop Serv)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1533",
        "descricao": "Estorno de Desconto (Aprop Serv)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1572",
        "descricao": "Estorno de Baixa Automática (Aprop Serv)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1573",
        "descricao": "Estorno de Baixa Automática Positiva (Aprop Serv)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1801",
        "descricao": "Estorno de Cancelamento de Apropriação de Serviço Prestado",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1802",
        "descricao": "Estorno de Cancelamento de Bolsa (Aprop Serv)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1825",
        "descricao": "Estorno de Cancelamento de Outros Acertos (Aprop Serv)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1833",
        "descricao": "Estorno de Cancelamento de Desconto (Aprop Serv)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1872",
        "descricao": "Estorno de Cancelamento de Baixa Automática (Aprop Serv)",
        "tipo": "Faturamento"
      },
      {
        "codigo": "1873",
        "descricao": "Estorno de Cancelamento de Baixa Automática Positiva (Aprop Serv)",
        "tipo": "Faturamento"
      }
    ],
    "regras": [
      {
        "tipo": "32",
        "nome": "Cobrança de Outras Dívidas",
        "analise": "Não contabilizar quando o PRINCIP_COD_LANC Outros",
        "acao": "Não parametrizar",
        "condicao": {
          "campo": "PRINCIP_COD_LANC",
          "operador": "em",
          "valores": [
            "OUTROS"
          ]
        }
      },
      {
        "tipo": "33",
        "nome": "Desconto na Dívida",
        "analise": "Não contabilizar quando o PRINCIP_COD_LANC for Outros",
        "acao": "Não parametrizar",
        "condicao": {
          "campo": "PRINCIP_COD_LANC",
          "operador": "em",
          "valores": [
            "OUTROS"
          ]
        }
      },
      {
        "tipo": "54",
        "nome": "Cobranca de Encargo",
        "analise": "Provisão do encargo - não há necessidade de contabilização para multa e juros, apenas para acréscimos e outros em (TIPO_ENCARGO).",
        "acao": "Não parametrizar (multa e juros)",
        "condicao": {
          "campo": "TIPO_ENCARGO",
          "operador": "em",
          "valores": [
            "MULTA",
            "JUROS"
          ]
        }
      },
      {
        "tipo": "59",
        "nome": "Baixa de Encargo por Desconto",
        "analise": "Maioria relacionada a acordo ou caso de dispensa de encargos por calendário de DU (Baixa da operação 54, não precisa multa e juros. Acréscimos e outros casos parametrizar)",
        "acao": "Não parametrizar (multa e juros)",
        "condicao": {
          "campo": "TIPO_ENCARGO",
          "operador": "vazio_ou_em",
          "valores": [
            "MULTA",
            "JUROS"
          ]
        }
      },
      {
        "tipo": "60",
        "nome": "Baixa de Encargo por Acordo",
        "analise": "Todos relacionados a acordo (Baixa da operação 54, não precisa multa e juros. Acréscimos e outros casos parametrizar)",
        "acao": "Não parametrizar (multa e juros)",
        "condicao": {
          "campo": "TIPO_ENCARGO",
          "operador": "vazio_ou_em",
          "valores": [
            "MULTA",
            "JUROS"
          ]
        }
      },
      {
        "tipo": "65",
        "nome": "Depósito Não Identificado (DNI)",
        "analise": "Inconsistência - erro no fluxo de retorno bancário (ajustado manualmente pelo time financeiro) - Não há necessidade de contabilização.",
        "acao": "Não parametrizar",
        "condicao": null
      },
      {
        "tipo": "70",
        "nome": "Recebimento de Processo Seletivo",
        "analise": "Impossibilidade de contabilização devido ao não preenchimento da unidade no Argyros",
        "acao": "Aguardando chamado financeiro com a TI",
        "condicao": null
      },
      {
        "tipo": "71",
        "nome": "Alteracao de Vencimento de Cobranca",
        "analise": "Não deve haver contabilização - Operação sem valor financeiro",
        "acao": "Não parametrizar",
        "condicao": null
      },
      {
        "tipo": "75",
        "nome": "Parcela de Cartão de Crédito A Receber",
        "analise": "Não deve haver contabilização - Sem controle de cartão no Lyceum",
        "acao": "Não parametrizar - Aguardar controle no Lyceum e preenchimento da unidade no Argyros",
        "condicao": null
      },
      {
        "tipo": "76",
        "nome": "Baixa de Parcela de Cartão de Crédito",
        "analise": "Não deve haver contabilização - Sem controle de cartão no Lyceum",
        "acao": "Não parametrizar - Aguardar controle no Lyceum e preenchimento da unidade no Argyros",
        "condicao": null
      },
      {
        "tipo": "77",
        "nome": "Taxa de Cartão de Crédito",
        "analise": "Não deve haver contabilização - Sem controle de cartão no Lyceum",
        "acao": "Não parametrizar - Aguardar controle no Lyceum e preenchimento da unidade no Argyros",
        "condicao": null
      },
      {
        "tipo": "90",
        "nome": "Emissao de Nota Fiscal",
        "analise": "Não deve haver contabilização de NF, pois a receita é contabilizada por cobrança.",
        "acao": "Não parametrizar",
        "condicao": null
      },
      {
        "tipo": "92",
        "nome": "Nota Fiscal (Valor de Serviço)",
        "analise": "Não deve haver contabilização de NF, pois a receita é contabilizada por cobrança.",
        "acao": "Não parametrizar",
        "condicao": null
      },
      {
        "tipo": "93",
        "nome": "Nota Fiscal (Valor de Desconto Incondicional)",
        "analise": "Não deve haver contabilização de NF, pois a receita é contabilizada por cobrança.",
        "acao": "Não parametrizar",
        "condicao": null
      },
      {
        "tipo": "332",
        "nome": "Cancelamento de Cobrança de Outras Dívidas",
        "analise": "Não contabilizar quando o PRINCIP_COD_LANC Outros",
        "acao": "Não parametrizar",
        "condicao": {
          "campo": "PRINCIP_COD_LANC",
          "operador": "em",
          "valores": [
            "OUTROS"
          ]
        }
      },
      {
        "tipo": "333",
        "nome": "Cancelamento Desconto na Dívida",
        "analise": "Não contabilizar quando o PRINCIP_COD_LANC for Outros, FIES ou Coparticipação",
        "acao": "Não parametrizar",
        "condicao": {
          "campo": "PRINCIP_COD_LANC",
          "operador": "em",
          "valores": [
            "OUTROS",
            "FIES",
            "COPARTICIPAÇÃO",
            "COPARTICIPACAO"
          ]
        }
      },
      {
        "tipo": "51",
        "nome": "Compensação em Outra Cobrança (pagamento a maior)",
        "analise": "Compensação de crédito - Contabiliza pela 50",
        "acao": "Não parametrizar",
        "condicao": null
      },
      {
        "tipo": "351",
        "nome": "Cancelamento de Compensação em Outra Cobrança (pagamento a maior)",
        "analise": "Não parametrizar - Contabilização refletida na operação 50",
        "acao": "Não parametrizar",
        "condicao": null
      },
      {
        "tipo": "363",
        "nome": "Cancelamento de Desconto a Maior",
        "analise": "Não parametrizar - ficar atenta aos casos",
        "acao": "Não parametrizar",
        "condicao": null
      },
      {
        "tipo": "392",
        "nome": "Cancelamento de Nota Fiscal (Valor de Serviço)",
        "analise": "Não deve haver contabilização de NF, pois a receita é contabilizada por cobrança.",
        "acao": "Não parametrizar",
        "condicao": null
      },
      {
        "tipo": "393",
        "nome": "Cancelamento de Nota Fiscal (Valor de Desconto Incondicional)",
        "analise": "Não deve haver contabilização de NF, pois a receita é contabilizada por cobrança.",
        "acao": "Não parametrizar",
        "condicao": null
      },
      {
        "tipo": "1032",
        "nome": "Estorno de Cobrança de Outras Dívidas",
        "analise": "Não contabilizar quando o PRINCIP_COD_LANC Outros",
        "acao": "Não parametrizar",
        "condicao": {
          "campo": "PRINCIP_COD_LANC",
          "operador": "em",
          "valores": [
            "OUTROS"
          ]
        }
      },
      {
        "tipo": "1054",
        "nome": "Estorno de Cobranca de Encargo",
        "analise": "Estorno de provisão do encargo - não há necessidade de contabilização (multa e juros, acréscimos e outros casos parametrizar)",
        "acao": "Não parametrizar (multa e juros)",
        "condicao": {
          "campo": "TIPO_ENCARGO",
          "operador": "em",
          "valores": [
            "MULTA",
            "JUROS"
          ]
        }
      },
      {
        "tipo": "1059",
        "nome": "Estorno de Baixa de Encargo por Desconto",
        "analise": "Contrário da 59 (multa e juros, acréscimos e outros casos parametrizar)",
        "acao": "Não parametrizar (multa e juros)",
        "condicao": {
          "campo": "TIPO_ENCARGO",
          "operador": "vazio_ou_em",
          "valores": [
            "MULTA",
            "JUROS"
          ]
        }
      },
      {
        "tipo": "360",
        "nome": "Cancelamento de Baixa de Encargo por Acordo",
        "analise": "Todos relacionados a acordo (Baixa da operação 54, não precisa multa e juros. Acréscimos e outros casos parametrizar)",
        "acao": "Não parametrizar (multa e juros)",
        "condicao": {
          "campo": "TIPO_ENCARGO",
          "operador": "vazio_ou_em",
          "valores": [
            "MULTA",
            "JUROS"
          ]
        }
      },
      {
        "tipo": "354",
        "nome": "Cancelamento de Cobranca de Encargo",
        "analise": "Provisão do encargo - não há necessidade de contabilização para multa e juros, apenas para acréscimos e outros em (TIPO_ENCARGO).",
        "acao": "Não parametrizar (multa e juros)",
        "condicao": {
          "campo": "TIPO_ENCARGO",
          "operador": "em",
          "valores": [
            "MULTA",
            "JUROS"
          ]
        }
      },
      {
        "tipo": "1033",
        "nome": "Estorno de Desconto na Dívida",
        "analise": "Não contabilizar quando o PRINCIP_COD_LANC for Outros, FIES ou Coparticipação",
        "acao": "Não parametrizar",
        "condicao": {
          "campo": "PRINCIP_COD_LANC",
          "operador": "em",
          "valores": [
            "OUTROS",
            "FIES",
            "COPARTICIPAÇÃO",
            "COPARTICIPACAO"
          ]
        }
      }
    ],
    "topicos": [
      "FATURAMENTO POR SEMESTRE",
      "PROV RECEITA",
      "CF",
      "TX MATRÍCULA / VESTIBULAR",
      "RECEITA FINANCEIRA",
      "DESCONTO INCONDICIONAL",
      "CANCELAMENTOS",
      "IMPOSTOS",
      "DEDUÇÃO FIES",
      "BOLSA PROUNI",
      "PDD",
      "DESCONTO PONTUALIDADE",
      "DESCONTO CONDICIONAL"
    ],
    "contaTopico": {
      "301010101001": "FATURAMENTO POR SEMESTRE",
      "301010101002": "CF",
      "301010101003": "PROV RECEITA",
      "301010101015": "FATURAMENTO POR SEMESTRE",
      "301010101080": "TX MATRÍCULA / VESTIBULAR",
      "301010101200": "TX MATRÍCULA / VESTIBULAR",
      "301010101902": "TX MATRÍCULA / VESTIBULAR",
      "301010101998": "CANCELAMENTOS",
      "301010102001": "BOLSA PROUNI",
      "301010102003": "DESCONTO CONDICIONAL",
      "301010102010": "DESCONTO INCONDICIONAL",
      "301010102081": "DESCONTO INCONDICIONAL",
      "301010102082": "DESCONTO INCONDICIONAL",
      "301010102095": "DESCONTO PONTUALIDADE",
      "301010102110": "CANCELAMENTOS",
      "301010102197": "DESCONTO CONDICIONAL",
      "301010102999": "DEDUÇÃO FIES",
      "301012001001": "RECEITA FINANCEIRA",
      "301012002002": "RECEITA FINANCEIRA",
      "301010102004": "DESCONTO CONDICIONAL",
      "301010102006": "DESCONTO CONDICIONAL",
      "301010101904": "FATURAMENTO POR SEMESTRE",
      "301010102008": "DESCONTO PONTUALIDADE",
      "301010102198": "DESCONTO CONDICIONAL"
    },
    "unidadesResumo": [
      {
        "nome": "SALVADOR",
        "filial": "010101",
        "ccRegra": "igual",
        "unidadeBI": "UNIFTC-SSA",
        "iss": 0.05,
        "pdd": 0.015,
        "razaoSocial": "INSTITUTO DE ENSINO EM SAUDE S/A - 10.318.902/0001-24"
      },
      {
        "nome": "UNECE MED",
        "filial": "020101",
        "ccRegra": "igual",
        "unidadeBI": "MEDUNECE-EUN",
        "iss": 0.03,
        "pdd": 0.02,
        "razaoSocial": "UNIÃO DE EDUCAÇÃO E CULTURA - LTDA - 02.754.493/0001-70"
      },
      {
        "nome": "UNECE EXMED",
        "filial": "020101",
        "ccRegra": "diferente",
        "unidadeBI": "UNECE-EUN",
        "iss": 0.03,
        "pdd": 0.028,
        "razaoSocial": "UNIÃO DE EDUCAÇÃO E CULTURA - LTDA - 02.754.493/0001-80"
      },
      {
        "nome": "ITUMBIARA",
        "filial": "060101",
        "ccRegra": "igual",
        "unidadeBI": "IMEPAC-ITUMB",
        "iss": 0.03,
        "pdd": 0.023,
        "razaoSocial": "FACULDADE DE MEDICINA DE ITUMBIARA LTDA - 44.422.513/0001-66"
      },
      {
        "nome": "POUSO ALEGRE MED",
        "filial": "070101",
        "ccRegra": "igual",
        "unidadeBI": "ZARNS-PA",
        "iss": 0.02,
        "pdd": 0.016,
        "razaoSocial": "ODONTO RAD LTDA - 00.832.682/0001-07"
      },
      {
        "nome": "POUSO ALEGRE EXMED",
        "filial": "070101",
        "ccRegra": "diferente",
        "unidadeBI": "ZARNS-PA ODON",
        "iss": 0.02,
        "pdd": 0.002,
        "razaoSocial": "ODONTO RAD LTDA - 00.832.682/0001-07"
      },
      {
        "nome": "ARAGUARI MED",
        "filial": "090101",
        "ccRegra": "igual",
        "unidadeBI": "IMEPAC -ARAGUARI",
        "iss": 0.03,
        "pdd": 0.01,
        "razaoSocial": "CENTRO UNIVERSITARIO IMEPAC LTDA - 57.904.402/0001-38"
      },
      {
        "nome": "ARAGUARI EXMED",
        "filial": "090101",
        "ccRegra": "diferente",
        "unidadeBI": "IMEPAC -ARAGUARI EXMED",
        "iss": 0.03,
        "pdd": 0.023,
        "razaoSocial": "CENTRO UNIVERSITARIO IMEPAC LTDA - 57.904.402/0001-38"
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);
