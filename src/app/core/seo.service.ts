import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  constructor(
    private title: Title,
    private meta: Meta
  ) { }

  updateTitle(title: string) {
    this.title.setTitle(title);
  }

  updateDescription(desc: string) {
    this.meta.updateTag({ name: 'description', content: desc })
  }

  updateOgTitle(title: string) {
    this.meta.updateTag({name: 'og:title', content: title});
  }

  updateOgDescription(description: string) {
    this.meta.updateTag({name: 'og:description', content: description});
  }

  updateOgUrl(url: string) {
    this.meta.updateTag({name: 'og:url', content: url});
  }

  updateOgSiteName(sitename: string) {
    this.meta.updateTag({name: 'og:site_name', content: sitename})
  }

  updateOgImage(imageUrl: string) {
    this.meta.updateTag({name: 'og:image', content: imageUrl})
  }

  updateTwitterTitle(twitterTitle: string) {
    this.meta.updateTag({name: 'twitter:title', content: twitterTitle});
  }

  updateTwitterDescription(twitterDescription: string) {
    this.meta.updateTag({name: 'twitter:description', content: twitterDescription});
  }

  updateTwitterImage(twitterImage: string) {
    this.meta.updateTag({name: 'twitter:image', content: twitterImage});
  }
}
