# Diffy Squares Integration Plan

This document captures the recommended path for bringing the Diffy Squares experience into The Number Garden in a way that preserves the quality of the interaction while removing the awkward MathExplorers branding mismatch.

## Current situation

Right now, The Number Garden is embedding the live app at:

- `https://www.mathexplorers.xyz/app`

That works technically, but it creates a brand mismatch because the app still presents itself as `MathExplorers`.

The good news is that the actual source code exists locally at:

- `/Users/dev/src/math-explorers-app/MathExplorers`

Important source files:

- `/Users/dev/src/math-explorers-app/MathExplorers/app/diffy-squares.tsx`
- `/Users/dev/src/math-explorers-app/MathExplorers/components/DiffySquaresViz.tsx`
- `/Users/dev/src/math-explorers-app/MathExplorers/components/MidpointInput.tsx`
- `/Users/dev/src/math-explorers-app/MathExplorers/hooks/useDiffySquares.ts`
- `/Users/dev/src/math-explorers-app/MathExplorers/hooks/useShake.ts`
- `/Users/dev/src/math-explorers-app/MathExplorers/hooks/usePinchZoom.ts`
- `/Users/dev/src/math-explorers-app/MathExplorers/constants/theme.ts`
- `/Users/dev/src/math-explorers-app/MathExplorers/app.json`

## Recommendation

Do not rebuild this interaction from scratch inside the Astro site right now.

Instead:

1. Rebrand the existing Expo app source for a Number Garden web export
2. Simplify the web flow so it goes directly into Diffy Squares
3. Export a dedicated web build
4. Self-host that build from this repo
5. Replace the external iframe with a local embed or local child page

This gives the best balance of:

- preserving the polished animations and interaction design
- avoiding unnecessary reimplementation
- removing the cross-branding problem
- keeping future edits possible

## Why this is the right path

The current Diffy Squares experience is not a trivial widget. It includes:

- staged drawing animations
- intro-state transitions
- corner inputs appearing after the square draw
- animated midpoint inputs
- shake feedback on incorrect answers
- fly-to-label transitions after correct answers
- progression through generations
- end-state reflection prompts

Those are already implemented well in the Expo app source. Rebuilding all of that immediately inside Astro would be slow and risky.

## What needs to change

### 1. App identity

Current branding source:

- `app.json`
- logo assets
- logo usage in screens

Likely changes:

- change app name from `MathExplorers`
- change slug and scheme
- update favicon and app icon assets for web
- change metadata/title for the exported web build

Relevant file:

- `/Users/dev/src/math-explorers-app/MathExplorers/app.json`

## 2. Web entry flow

Right now the app includes:

- intro screen
- topics screen
- Diffy Squares topic page

For The Number Garden, that is probably too much shell around a single pedagogical example.

Recommendation:

- keep the Diffy Squares route
- either remove or bypass the intro and topics shell for the Number Garden web export

Best near-term web behavior:

- load directly into `Diffy Squares`

That avoids:

- unnecessary extra clicks
- broader `MathExplorers` framing
- making the experience feel like a separate product

Relevant files:

- `/Users/dev/src/math-explorers-app/MathExplorers/app/index.tsx`
- `/Users/dev/src/math-explorers-app/MathExplorers/app/index.web.tsx`
- `/Users/dev/src/math-explorers-app/MathExplorers/app/topics.tsx`

## 3. In-screen branding

The Diffy Squares screen itself includes a visible logo in the header.

Relevant file:

- `/Users/dev/src/math-explorers-app/MathExplorers/app/diffy-squares.tsx`

Relevant line area already confirmed:

- the header renders `require('../assets/logo-mark.png')`

Recommendation:

- remove the logo from the Diffy Squares screen for the Number Garden version
- or replace it with a Number Garden mark if and only if the right asset already exists

Near-term preference:

- remove it entirely

That keeps the screen focused and avoids solving branding through forced logo placement.

## 4. Theme

The app theme is currently designed around the MathExplorers palette:

- dark background
- orange/teal accents

Relevant file:

- `/Users/dev/src/math-explorers-app/MathExplorers/constants/theme.ts`

Recommendation:

- do not change the whole palette in the first pass unless there is a strong reason

Why:

- the current palette is already tuned to the interaction
- color changes can create hidden regressions in contrast and animation feel
- the main problem right now is cross-branding, not palette mismatch

If we want to soften the mismatch later, do it deliberately in a second pass.

## Export strategy

The strongest practical option is to produce a dedicated web export of the rebranded app and host it within The Number Garden site.

Recommended final hosted path:

- `/about/diffy-squares/app/`

or

- `/diffy-squares-app/`

My preference:

- `/about/diffy-squares/app/`

That keeps the information architecture aligned with the current site story.

## Integration on The Number Garden side

Once the rebranded export exists, update the site to:

1. replace the external `mathexplorers.xyz` iframe with a local iframe
2. keep the current `About` and homepage framing
3. optionally add a direct full-screen link for mobile users

That means the current content structure can stay mostly intact.

## Suggested implementation phases

### Phase 1: Rebrand for a Number Garden web export

Goal:

- remove MathExplorers identity from the app shell

Tasks:

- update `app.json`
- remove or replace logo usage in `diffy-squares.tsx`
- decide whether intro and topics screens stay in the Number Garden export

Success criteria:

- no visible `MathExplorers` branding in the Diffy Squares web experience

### Phase 2: Simplify the route flow

Goal:

- make the web version open directly into the Diffy Squares experience

Tasks:

- decide whether `/` should route to `/diffy-squares`
- or whether a separate Number Garden build should contain only this route

Success criteria:

- a parent can open the experience without entering a separate app ecosystem

### Phase 3: Export and self-host

Goal:

- host the experience as part of The Number Garden

Tasks:

- generate a new web export from the Expo app
- copy the exported build into this repo under a stable public path
- replace the external iframe with a local embed

Success criteria:

- the experience is served from `thenumbergarden.com`
- the brand experience feels coherent from page copy through interaction

### Phase 4: Polish

Goal:

- make the surrounding editorial and app experience feel intentionally unified

Tasks:

- review sizing and mobile behavior
- refine explanatory copy on the About child page
- optionally add a screenshot or poster image
- decide whether a local iframe or direct page link is better on mobile

## Open decisions

These are the key decisions we still need to make:

### 1. Intro and topics screens

Options:

- keep them
- simplify them
- bypass them entirely for The Number Garden

Recommendation:

- bypass them for now

### 2. Logo treatment

Options:

- remove logo from the Diffy Squares screen
- replace with a Number Garden mark

Recommendation:

- remove it first

### 3. Color palette

Options:

- keep current theme
- partially retheme
- fully retheme

Recommendation:

- keep current theme in version one

### 4. Hosting path

Options:

- host within `/about/diffy-squares/app/`
- host as a separate top-level app path

Recommendation:

- host within the About pathway

## Recommended next action

The next concrete move should be:

1. make a Number-Garden-specific pass on the Expo source
2. export a local web build
3. test that local build before wiring it into this site

That is the shortest path to a coherent branded experience without throwing away the work already embodied in the app.
