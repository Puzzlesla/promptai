const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'promptai',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const listAllProjectsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllProjects');
}
listAllProjectsRef.operationName = 'ListAllProjects';
exports.listAllProjectsRef = listAllProjectsRef;

exports.listAllProjects = function listAllProjects(dc) {
  return executeQuery(listAllProjectsRef(dc));
};

const myProjectsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'MyProjects');
}
myProjectsRef.operationName = 'MyProjects';
exports.myProjectsRef = myProjectsRef;

exports.myProjects = function myProjects(dc) {
  return executeQuery(myProjectsRef(dc));
};

const createProjectRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateProject', inputVars);
}
createProjectRef.operationName = 'CreateProject';
exports.createProjectRef = createProjectRef;

exports.createProject = function createProject(dcOrVars, vars) {
  return executeMutation(createProjectRef(dcOrVars, vars));
};

const getProjectDetailsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetProjectDetails', inputVars);
}
getProjectDetailsRef.operationName = 'GetProjectDetails';
exports.getProjectDetailsRef = getProjectDetailsRef;

exports.getProjectDetails = function getProjectDetails(dcOrVars, vars) {
  return executeQuery(getProjectDetailsRef(dcOrVars, vars));
};
