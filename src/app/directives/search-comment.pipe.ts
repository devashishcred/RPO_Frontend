import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchComment'
})
export class SearchCommentPipe implements PipeTransform {

  transform(list: any[], searchText: string): any[] {
    if (!list) { return []; }
    if (!searchText) { return list; }

    searchText = searchText.toLowerCase();
    return list.filter( item => {
          return item.comments.toLowerCase().includes(searchText);
        });
      }
}
