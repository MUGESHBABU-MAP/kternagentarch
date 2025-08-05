import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';


// Components
import { AgenticAssessmentLayoutComponent } from './components/agentic-assessment-layout/agentic-assessment-layout.component';
import { AgentOrchestrationComponent } from './components/agent-orchestration/agent-orchestration.component';
import { AgentCardComponent } from './components/agent-card/agent-card.component';
import { AgentTimelineComponent } from './components/agent-timeline/agent-timeline.component';
import { SystemAnalysisAgentComponent } from './components/agents/system-analysis-agent/system-analysis-agent.component';
import { DataProcessingAgentComponent } from './components/agents/data-processing-agent/data-processing-agent.component';
import { SecurityAssessmentAgentComponent } from './components/agents/security-assessment-agent/security-assessment-agent.component';
import { ReportGenerationAgentComponent } from './components/agents/report-generation-agent/report-generation-agent.component';
import { AgentDashboardComponent } from './components/agent-dashboard/agent-dashboard.component';

const routes = [
  {
    path: '',
    component: AgenticAssessmentLayoutComponent,
    children: [
      { path: '', redirectTo: 'orchestration', pathMatch: 'full' },
      { path: 'orchestration', component: AgentOrchestrationComponent },
      { path: 'dashboard', component: AgentDashboardComponent }
    ]
  }
];

@NgModule({
  declarations: [
    AgenticAssessmentLayoutComponent,
    AgentOrchestrationComponent,
    AgentCardComponent,
    AgentTimelineComponent,
    SystemAnalysisAgentComponent,
    DataProcessingAgentComponent,
    SecurityAssessmentAgentComponent,
    ReportGenerationAgentComponent,
    AgentDashboardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class AgenticAssessmentModule { }
