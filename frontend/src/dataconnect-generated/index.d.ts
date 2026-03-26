import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateProjectData {
  project_insert: Project_Key;
}

export interface CreateProjectVariables {
  title: string;
  description?: string | null;
  status: string;
  aiGenerated?: boolean | null;
}

export interface GetProjectDetailsData {
  project?: {
    id: UUIDString;
    title: string;
    description?: string | null;
    status: string;
    aiGenerated?: boolean | null;
    currentPoints?: number | null;
    currentStreak?: number | null;
    createdAt: TimestampString;
    user: {
      displayName: string;
      email: string;
    };
      steps_on_project: ({
        id: UUIDString;
        title: string;
        order: number;
        status: string;
        description?: string | null;
        completedAt?: TimestampString | null;
        resources_on_step: ({
          id: UUIDString;
          title: string;
          url: string;
          description?: string | null;
        } & Resource_Key)[];
      } & Step_Key)[];
  } & Project_Key;
}

export interface GetProjectDetailsVariables {
  id: UUIDString;
}

export interface ListAllProjectsData {
  projects: ({
    id: UUIDString;
    title: string;
    description?: string | null;
    status: string;
    createdAt: TimestampString;
    user: {
      id: UUIDString;
      displayName: string;
      email: string;
    } & User_Key;
  } & Project_Key)[];
}

export interface MyProjectsData {
  projects: ({
    id: UUIDString;
    title: string;
    status: string;
    currentPoints?: number | null;
    currentStreak?: number | null;
  } & Project_Key)[];
}

export interface Project_Key {
  id: UUIDString;
  __typename?: 'Project_Key';
}

export interface Resource_Key {
  id: UUIDString;
  __typename?: 'Resource_Key';
}

export interface Step_Key {
  id: UUIDString;
  __typename?: 'Step_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface ListAllProjectsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllProjectsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListAllProjectsData, undefined>;
  operationName: string;
}
export const listAllProjectsRef: ListAllProjectsRef;

export function listAllProjects(): QueryPromise<ListAllProjectsData, undefined>;
export function listAllProjects(dc: DataConnect): QueryPromise<ListAllProjectsData, undefined>;

interface MyProjectsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<MyProjectsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<MyProjectsData, undefined>;
  operationName: string;
}
export const myProjectsRef: MyProjectsRef;

export function myProjects(): QueryPromise<MyProjectsData, undefined>;
export function myProjects(dc: DataConnect): QueryPromise<MyProjectsData, undefined>;

interface CreateProjectRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateProjectVariables): MutationRef<CreateProjectData, CreateProjectVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateProjectVariables): MutationRef<CreateProjectData, CreateProjectVariables>;
  operationName: string;
}
export const createProjectRef: CreateProjectRef;

export function createProject(vars: CreateProjectVariables): MutationPromise<CreateProjectData, CreateProjectVariables>;
export function createProject(dc: DataConnect, vars: CreateProjectVariables): MutationPromise<CreateProjectData, CreateProjectVariables>;

interface GetProjectDetailsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetProjectDetailsVariables): QueryRef<GetProjectDetailsData, GetProjectDetailsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetProjectDetailsVariables): QueryRef<GetProjectDetailsData, GetProjectDetailsVariables>;
  operationName: string;
}
export const getProjectDetailsRef: GetProjectDetailsRef;

export function getProjectDetails(vars: GetProjectDetailsVariables): QueryPromise<GetProjectDetailsData, GetProjectDetailsVariables>;
export function getProjectDetails(dc: DataConnect, vars: GetProjectDetailsVariables): QueryPromise<GetProjectDetailsData, GetProjectDetailsVariables>;

