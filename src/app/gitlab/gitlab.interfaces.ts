export enum IssueScope {
  CREATED_BY_ME = 'created-by-me',
  ASSIGNED_TO_ME = 'assigned-to-me',
  ALL = 'all',
}

export interface GitLabIssueParams {
  state?: string;
  labels?: string[];
  milestone?: string;
  iids?: string;
  author_id?: string;
  assignee_id?: string;
  scope?: IssueScope;
}

export interface GitLabMilestoneParams {}
