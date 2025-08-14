import { Component, OnDestroy, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { AIHelperService, AIHelperMessage } from '../../../core/services/ai-helper.service';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-ai-helper',
  templateUrl: './ai-helper.component.html',
  styleUrls: ['./ai-helper.component.scss']
})
export class AIHelperComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer', { static: false }) private messagesContainer: ElementRef | undefined;
  
  messageControl = new FormControl('', [Validators.required]);
  state: {
    isOpen: boolean;
    isMinimized: boolean;
    isTyping: boolean;
    messages: AIHelperMessage[];
  } = {
    isOpen: false,
    isMinimized: false,
    isTyping: false,
    messages: []
  };

  suggestedQuestions = [
    'How do I create a new agent?',
    'What agents are available?',
    'How do I monitor agent progress?',
    'Where can I find execution results?'
  ];
  
  private stateSubscription: Subscription = new Subscription();
  private routerSubscription: Subscription = new Subscription();

  constructor(
    private aiHelper: AIHelperService,
    private router: Router,
    private el: ElementRef
  ) {
    // Initialize with empty constructor body
  }

  ngOnInit(): void {
    // Subscribe to state changes
    this.stateSubscription = this.aiHelper.state$.subscribe(state => {
      this.state = {
        isOpen: state.isOpen,
        isMinimized: state.isMinimized,
        isTyping: state.isTyping,
        messages: [...state.messages]
      };
      
      // Scroll to bottom when new messages arrive
      this.scrollToBottom();
    });

    // Update context based on route changes
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateContextFromRoute();
    });
    
    // Initial context update
    this.updateContextFromRoute();
  }

  ngOnDestroy(): void {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  toggleHelper(): void {
    this.aiHelper.toggleHelper();
  }

  minimizeHelper(): void {
    this.aiHelper.minimizeHelper();
  }

  closeHelper(): void {
    this.aiHelper.closeHelper();
  }

  sendMessage(content?: string): void {
    const message = content || this.messageControl.value.trim();
    
    if (message) {
      this.aiHelper.sendMessage(message).subscribe({
        error: (error) => {
          console.error('Error sending message:', error);
          // Add error message to chat
          this.aiHelper.addMessage({
            id: this.aiHelper['generateId'](),
            content: 'Sorry, I encountered an error. Please try again.',
            sender: 'ai',
            timestamp: new Date(),
            type: 'error'
          });
        }
      });
      
      if (!content) {
        this.messageControl.reset();
      }
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (this.messageControl.valid) {
        this.sendMessage();
      }
    }
  }
  
  onSuggestedQuestionClick(question: string): void {
    this.sendMessage(question);
  }
  
  private updateContextFromRoute(): void {
    const url = this.router.url;
    let context = {};
    
    // Set context based on route
    if (url.includes('/agents/agent/')) {
      const agentId = url.split('/agents/agent/')[1].split('/')[0];
      context = { agentId, page: 'agent-detail' };
    } else if (url.includes('/agents/hub')) {
      context = { page: 'agent-hub' };
    } else if (url.includes('/agents/my-agents')) {
      context = { page: 'my-agents' };
    } else if (url.includes('/agents/progress')) {
      context = { page: 'agent-progress' };
    } else if (url.includes('/agents/results')) {
      context = { page: 'agent-results' };
    }
    
    this.aiHelper.updateContext(context);
  }
  
  private scrollToBottom(): void {
    try {
      if (this.messagesContainer && this.messagesContainer.nativeElement) {
        const element = this.messagesContainer.nativeElement;
        setTimeout(() => {
          element.scrollTop = element.scrollHeight;
        }, 100);
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  trackByMessageId(index: number, message: AIHelperMessage): string {
    return message.id;
  }
}
