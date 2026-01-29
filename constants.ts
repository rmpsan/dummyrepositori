import { Project, User } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Carlos Gerente',
    email: 'admin@dummy.com',
    password: '123',
    role: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=Carlos+Gerente&background=6366f1&color=fff'
  },
  {
    id: 'u2',
    name: 'Ana Editora',
    email: 'ana@dummy.com',
    password: '123',
    role: 'editor',
    avatar: 'https://ui-avatars.com/api/?name=Ana+Editora&background=ec4899&color=fff'
  },
  {
    id: 'u3',
    name: 'João Assistente',
    email: 'joao@dummy.com',
    password: '123',
    role: 'assistant',
    avatar: 'https://ui-avatars.com/api/?name=Joao+Assistente&background=10b981&color=fff'
  }
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Campanha de Verão',
    client: 'Coca-Cola',
    type: 'Comercial TV',
    structure: 'Simples',
    status: 'Em andamento',
    priority: 'Alta',
    description: 'Edição de comercial de 30s para TV aberta.',
    startDate: '2024-05-01',
    deadline: '2024-05-20',
    versionDeadlines: {
      v1: '2024-05-10',
      v2: '2024-05-15',
      final: '2024-05-20'
    },
    hoursBudgeted: 40,
    hoursUsed: 28,
    editorIds: ['u2', 'u3'],
    deliverables: [
      {
        id: 'd1',
        title: 'Comercial Principal 30s',
        status: 'Em andamento',
        versions: [
          {
            id: 'v1',
            versionType: 'V1',
            link: 'https://dropbox.com/file/v1',
            submittedAt: '2024-05-10T14:00:00',
            notes: 'Primeiro corte, aguardando aprovação de cor.'
          }
        ]
      }
    ],
    comments: [
      {
        id: 'c1',
        userId: 'u1',
        userName: 'Carlos Gerente',
        text: 'Atenção ao prazo da V2, o cliente está ansioso.',
        createdAt: '2024-05-11T09:00:00'
      }
    ],
    timeLogs: [
      {
        id: 't1',
        userId: 'u2',
        userName: 'Ana Editora',
        hours: 8,
        date: '2024-05-02',
        description: 'Ingest e organização do material.'
      }
    ]
  },
  {
    id: 'p2',
    name: 'Curso Finanças Pessoais',
    client: 'Banco Itaú',
    type: 'Educacional',
    structure: 'Curso',
    status: 'Pausado',
    priority: 'Média',
    description: 'Curso online com 2 módulos sobre investimentos.',
    startDate: '2024-04-15',
    deadline: '2024-06-01',
    versionDeadlines: {
      v1: '2024-05-01',
      final: '2024-06-01'
    },
    hoursBudgeted: 80,
    hoursUsed: 12,
    editorIds: ['u2'],
    deliverables: [
      {
        id: 'd2',
        title: 'Aula 01: Introdução',
        group: 'Módulo 1: Básico',
        status: 'Finalizado',
        versions: [
          {
            id: 'v2',
            versionType: 'Final',
            link: 'https://drive.com/aula01_final',
            submittedAt: '2024-04-20T10:00:00',
            notes: 'Aprovado pelo cliente.'
          }
        ]
      },
      {
        id: 'd3',
        title: 'Aula 02: Renda Fixa',
        group: 'Módulo 1: Básico',
        status: 'Pausado',
        versions: []
      },
      {
        id: 'd4',
        title: 'Aula 03: Ações',
        group: 'Módulo 2: Avançado',
        status: 'Em andamento',
        versions: []
      }
    ],
    comments: [],
    timeLogs: []
  },
  {
    id: 'p3',
    name: 'Lançamento Produto X',
    client: 'Nike',
    type: 'Social Media',
    structure: 'Campanha',
    status: 'Em andamento',
    priority: 'Urgente',
    description: 'Pacote de assets para Instagram.',
    startDate: '2024-05-12',
    deadline: '2024-05-15',
    versionDeadlines: {
      v1: '2024-05-13',
      final: '2024-05-15'
    },
    hoursBudgeted: 10,
    hoursUsed: 9.5,
    editorIds: ['u3'],
    deliverables: [
      {
        id: 'd5',
        title: 'Reels Teaser',
        group: 'Instagram',
        status: 'Em andamento',
        versions: []
      },
      {
        id: 'd6',
        title: 'Story 15s',
        group: 'Instagram',
        status: 'Em andamento',
        versions: []
      }
    ],
    comments: [],
    timeLogs: []
  }
];