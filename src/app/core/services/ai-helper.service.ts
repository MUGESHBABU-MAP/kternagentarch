import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

export interface AIHelperMessage {
  id: string;
  content: string;
  sender: 'ai' | 'user';
  timestamp: Date;
  context?: any;
  type?: 'welcome' | 'help' | 'suggestion' | 'error' | 'info';
}

export interface AIHelperState {
  isOpen: boolean;
  isMinimized: boolean;
  isTyping: boolean;
  messages: AIHelperMessage[];
  context: any;
}

@Injectable({
  providedIn: 'root'
})
export class AIHelperService {
  private state = new BehaviorSubject<AIHelperState>({
    isOpen: false,
    isMinimized: false,
    isTyping: false,
    messages: [],
    context: null
  });

  state$ = this.state.asObservable();

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    // Initialize with welcome message if no messages exist
    if (this.state.value.messages.length === 0) {
      this.addMessage({
        id: this.generateId(),
        content: 'Hello! I\'m your AI assistant. How can I help you today?',
        sender: 'ai',
        timestamp: new Date(),
        type: 'welcome'
      });
    }
  }

  toggleHelper(): void {
    this.state.next({
      ...this.state.value,
      isOpen: !this.state.value.isOpen,
      isMinimized: false
    });
  }

  minimizeHelper(): void {
    this.state.next({
      ...this.state.value,
      isMinimized: true
    });
  }

  openHelper(context?: any): void {
    this.state.next({
      ...this.state.value,
      isOpen: true,
      isMinimized: false,
      context: context || this.state.value.context
    });
  }

  closeHelper(): void {
    this.state.next({
      ...this.state.value,
      isOpen: false
    });
  }

  sendMessage(content: string, context?: any): Observable<AIHelperMessage> {
    const userMessage: AIHelperMessage = {
      id: this.generateId(),
      content,
      sender: 'user',
      timestamp: new Date(),
      context
    };

    this.addMessage(userMessage);
    this.setTyping(true);

    // In a real implementation, this would call an AI service
    return this.simulateAIResponse(content, context).pipe(
      map(aiResponse => {
        this.addMessage(aiResponse);
        this.setTyping(false);
        return aiResponse;
      })
    );
  }

  private simulateAIResponse(userMessage: string, context?: any): Observable<AIHelperMessage> {
    // This is a simple simulation - in a real app, this would call an AI service
    const responses: Record<string, string> = {
      'hello': 'Hi there! How can I assist you today?',
      'help': 'I can help you with navigating the platform, explaining agents, and providing guidance on using different features.',
      'agents': 'Agents are autonomous units that can perform specific tasks. You can find available agents in the Agent Hub.',
      'progress': 'Check the Agent Progress section to monitor the status of your running agents.',
      'results': 'View the results of completed agent executions in the Agent Results section.'
    };

    const lowerMessage = userMessage.toLowerCase();
    let response = responses[lowerMessage] || 
      'I\'m not sure how to help with that. Could you please provide more details?';

    // Add contextual help if available
    if (context && context.agentId) {
      response = `For agent ${context.agentId}: ${response}`;
    }

    return of({
      id: this.generateId(),
      content: response,
      sender: 'ai',
      timestamp: new Date(),
      type: 'help',
      context
    });
  }

  addMessage(message: AIHelperMessage): void {
    this.state.next({
      ...this.state.value,
      messages: [...this.state.value.messages, message]
    });
  }

  clearMessages(): void {
    this.state.next({
      ...this.state.value,
      messages: []
    });
    this.initialize();
  }

  updateContext(context: any): void {
    this.state.next({
      ...this.state.value,
      context: { ...this.state.value.context, ...context }
    });
  }

  private setTyping(isTyping: boolean): void {
    this.state.next({
      ...this.state.value,
      isTyping
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
