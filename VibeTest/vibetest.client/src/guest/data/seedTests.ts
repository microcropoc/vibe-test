import type { QuestionDefinition, TestDefinition } from '@/types';
import { SEED_META, type SeedTopicId } from './seed/meta';
import clickhouseQuestions from './seed/questions/clickhouse.json';
import csharpQuestions from './seed/questions/csharp.json';
import dockerQuestions from './seed/questions/docker.json';
import goQuestions from './seed/questions/go.json';
import javascriptQuestions from './seed/questions/javascript.json';
import kubernetesQuestions from './seed/questions/kubernetes.json';
import linuxQuestions from './seed/questions/linux.json';
import postgresqlQuestions from './seed/questions/postgresql.json';
import pythonQuestions from './seed/questions/python.json';
import reactQuestions from './seed/questions/react.json';
import typescriptQuestions from './seed/questions/typescript.json';

const QUESTIONS_BY_ID: Record<SeedTopicId, QuestionDefinition[]> = {
  csharp: csharpQuestions,
  javascript: javascriptQuestions,
  typescript: typescriptQuestions,
  python: pythonQuestions,
  go: goQuestions,
  react: reactQuestions,
  postgresql: postgresqlQuestions,
  clickhouse: clickhouseQuestions,
  docker: dockerQuestions,
  kubernetes: kubernetesQuestions,
  linux: linuxQuestions,
};

export const SEED_TESTS: TestDefinition[] = SEED_META.map(({ id, name, description }) => ({
  name,
  description,
  questions: QUESTIONS_BY_ID[id],
}));
