import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Agent, AgentCapability } from '../../../agentic-assessment/interfaces/agent.interface';

@Component({
  selector: 'app-agent-configuration',
  templateUrl: './agent-configuration.component.html',
  styleUrls: ['./agent-configuration.component.scss']
})
export class AgentConfigurationComponent implements OnInit {
  @Input() configuration: Agent | null = null;
  @Input() agent: Agent | null = null;

  @Output() configurationChange = new EventEmitter<Agent>();
  @Output() save = new EventEmitter<Agent>();
  @Output() cancel = new EventEmitter<void>();

  isEditMode = false;
  editedAgent: Agent | null = null;
  editableConfig: Agent | null = null;

  ngOnInit(): void {
    if (this.configuration) {
      this.editableConfig = JSON.parse(JSON.stringify(this.configuration));
    }
  }

  ngOnChanges(): void {
    if (this.configuration && !this.editableConfig) {
      this.editableConfig = JSON.parse(JSON.stringify(this.configuration));
    }
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    
    if (this.isEditMode && this.configuration) {
      this.editableConfig = JSON.parse(JSON.stringify(this.configuration));
    }
  }

  saveConfiguration(): void {
    if (this.editableConfig) {
      this.configuration = { ...this.editableConfig };
      this.configurationChange.emit(this.configuration);
      this.isEditMode = false;
    }
  }

  cancelEdit(): void {
    this.isEditMode = false;
    if (this.configuration) {
      this.editableConfig = JSON.parse(JSON.stringify(this.configuration));
    }
  }

  onAddCapability(): void {
    if (this.editableConfig) {
      const newCapability: AgentCapability = {
        id: 'new-capability',
        name: 'New Capability',
        description: 'Description for new capability',
        enabled: true
      };
      this.editableConfig.capabilities.push(newCapability);
    }
  }

  onRemoveCapability(index: number): void {
    if (this.editableConfig) {
      this.editableConfig.capabilities.splice(index, 1);
    }
  }

  onUpdateCapability(index: number, field: string, value: any): void {
    if (this.editableConfig && this.editableConfig.capabilities[index]) {
      (this.editableConfig.capabilities[index] as any)[field] = value;
    }
  }

  onAddDependency(): void {
    if (this.editableConfig) {
      this.editableConfig.dependencies.push('new-dependency-id');
    }
  }

  onRemoveDependency(index: number): void {
    if (this.editableConfig && this.editableConfig.dependencies) {
      this.editableConfig.dependencies.splice(index, 1);
    }
  }

  onCapabilityChange(capability: any, event: any): void {
    // Handle capability change
  }

  onDependencyChange(dependency: any, event: any): void {
    // Handle dependency change
  }

  onUpdateDependency(index: number, value: string): void {
    if (this.editableConfig) {
      this.editableConfig.dependencies[index] = value;
    }
  }

  getConfigValue(key: string): any {
    if (this.editableConfig) {
      return (this.editableConfig as any)[key];
    }
    if (this.configuration) {
      return (this.configuration as any)[key];
    }
    return '';
  }

  setConfigValue(key: string, value: any): void {
    if (this.editableConfig) {
      (this.editableConfig as any)[key] = value;
    }
  }

  trackByIndex(index: number): number {
    return index;
  }
}
