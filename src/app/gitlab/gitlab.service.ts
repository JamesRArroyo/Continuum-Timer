import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { GitLabIssueParams, IssueScope } from './gitlab.interfaces';
import { UsersService } from '../users/users.service';
import { User } from '../users/users.interface';

@Injectable()
export class GitlabService {
  private baseUrl = environment.gitlabApiUrl;
  private privateToken: string;

  constructor(private http: HttpClient, private usersService: UsersService) {
    this.usersService.user.subscribe((u: User) => {
      this.privateToken = u.gitlab ? u.gitlab.personalAccessToken : '';
    });
  }

  getIssues(params?: GitLabIssueParams) {
    const p: any = params || {};
    p.private_token = this.privateToken;
    p.scope = p.scope || IssueScope.ASSIGNED_TO_ME; // By default pulling issues assigned to the user
    return this.http.get<any[]>(`${this.baseUrl}/issues`, { params: p });
  }

  getProjectMilestones(projectId: string, params?: any) {
    const p: any = params || {};
    p.private_token = this.privateToken;
    p.state = p.state || 'active';
    return this.http.get<any[]>(
      `${this.baseUrl}/projects/${projectId}/milestones`,
      { params: p },
    );
  }

  getGroupMilestones(groupId: string, params?: any) {
    const p: any = params || {};
    p.private_token = this.privateToken;
    p.state = p.state || 'active';
    return this.http.get<any[]>(
      `${this.baseUrl}/groups/${groupId}/milestones`,
      { params: p },
    );
  }

  getGroups() {
    const p: any = { private_token: this.privateToken, order_by: 'name' };
    return this.http.get<any[]>(`${this.baseUrl}/groups`, { params: p });
  }

  getProjects() {
    const p: any = { private_token: this.privateToken, order_by: 'name' };
    return this.http.get<any[]>(`${this.baseUrl}/projects`, { params: p });
  }

  addSpentTimeOnIssue(projectId: string, issueId: string, seconds: string) {
    const duration = `${seconds}s`;
    const data: any = { duration, private_token: this.privateToken };
    return this.http.post<any[]>(
      `${this.baseUrl}/projects/${projectId}/issues/${issueId}/add_spent_time`,
      data,
    );
  }

  addCommentOnIssue(projectId: string, issueId: string, notes: any) {
    let body = `Timer Notes:`;
    // Concat notes object into string.
    for (const key in notes) {
      if (notes.hasOwnProperty(key)) {
        body = body.concat(`<br /> \ ${key}: ${notes[key]}`);
      }
    }
    const data: any = { body, private_token: this.privateToken };
    return this.http.post<any[]>(
      `${this.baseUrl}/projects/${projectId}/issues/${issueId}/notes`,
      data,
    );
  }
}
