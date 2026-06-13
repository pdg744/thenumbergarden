# Publish Packets

Publish packets are the future handoff format for approved content.

For now, this folder documents the intended shape. Actual packet folders should
be created only after a calendar item is approved and ready to schedule in Meta
Business Suite.

## Intended packet shape

```txt
publish-packets/
  2026-06-17-camp-invitation/
    README.md
    caption-instagram.txt
    caption-facebook.txt
    asset-feed.png
    asset-story.png
    asset-reel.mp4
    links.md
```

## Future automation notes

A future Make.com workflow can read approved packet metadata or an exported
approval table, fetch hosted media, and prepare Facebook/Instagram posts.

Publishing should remain manual until the approval workflow is proven.

