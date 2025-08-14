import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-agent-search',
  templateUrl: './agent-search.component.html',
  styleUrls: ['./agent-search.component.scss']
})
export class AgentSearchComponent implements OnInit {
  @Input() searchQuery: string = '';
  @Input() placeholder: string = 'Search agents...';
  @Output() searchChange = new EventEmitter<string>();

  searchControl = new FormControl('');

  ngOnInit(): void {
    // Set initial value
    this.searchControl.setValue(this.searchQuery);

    // Subscribe to search changes with debounce
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.searchChange.emit(value || '');
      });
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }
}
