import { ListAllProjectsData, MyProjectsData, CreateProjectData, CreateProjectVariables, GetProjectDetailsData, GetProjectDetailsVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useListAllProjects(options?: useDataConnectQueryOptions<ListAllProjectsData>): UseDataConnectQueryResult<ListAllProjectsData, undefined>;
export function useListAllProjects(dc: DataConnect, options?: useDataConnectQueryOptions<ListAllProjectsData>): UseDataConnectQueryResult<ListAllProjectsData, undefined>;

export function useMyProjects(options?: useDataConnectQueryOptions<MyProjectsData>): UseDataConnectQueryResult<MyProjectsData, undefined>;
export function useMyProjects(dc: DataConnect, options?: useDataConnectQueryOptions<MyProjectsData>): UseDataConnectQueryResult<MyProjectsData, undefined>;

export function useCreateProject(options?: useDataConnectMutationOptions<CreateProjectData, FirebaseError, CreateProjectVariables>): UseDataConnectMutationResult<CreateProjectData, CreateProjectVariables>;
export function useCreateProject(dc: DataConnect, options?: useDataConnectMutationOptions<CreateProjectData, FirebaseError, CreateProjectVariables>): UseDataConnectMutationResult<CreateProjectData, CreateProjectVariables>;

export function useGetProjectDetails(vars: GetProjectDetailsVariables, options?: useDataConnectQueryOptions<GetProjectDetailsData>): UseDataConnectQueryResult<GetProjectDetailsData, GetProjectDetailsVariables>;
export function useGetProjectDetails(dc: DataConnect, vars: GetProjectDetailsVariables, options?: useDataConnectQueryOptions<GetProjectDetailsData>): UseDataConnectQueryResult<GetProjectDetailsData, GetProjectDetailsVariables>;
