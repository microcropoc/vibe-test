export const SEED_META = [
  {
    id: 'csharp',
    name: 'C# — основы',
    description: 'Базовые вопросы по языку C# и платформе .NET',
  },
  {
    id: 'javascript',
    name: 'JavaScript — основы',
    description: 'Ключевые концепции JavaScript',
  },
  {
    id: 'typescript',
    name: 'TypeScript — основы',
    description: 'Типизация и синтаксис TypeScript',
  },
  {
    id: 'python',
    name: 'Python — основы',
    description: 'Базовый синтаксис и структуры Python',
  },
  {
    id: 'go',
    name: 'Go — основы',
    description: 'Синтаксис и идиомы языка Go',
  },
  {
    id: 'react',
    name: 'React — основы',
    description: 'Компоненты, состояние и рендеринг в React',
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL — основы',
    description: 'SQL и особенности PostgreSQL',
  },
  {
    id: 'clickhouse',
    name: 'ClickHouse — основы',
    description: 'Колоночная СУБД ClickHouse',
  },
  {
    id: 'docker',
    name: 'Docker — основы',
    description: 'Контейнеры и образы Docker',
  },
  {
    id: 'kubernetes',
    name: 'Kubernetes — основы',
    description: 'Оркестрация контейнеров в Kubernetes',
  },
  {
    id: 'linux',
    name: 'Linux — основы',
    description: 'Командная строка и основы Linux',
  },
] as const;

export type SeedTopicId = (typeof SEED_META)[number]['id'];
