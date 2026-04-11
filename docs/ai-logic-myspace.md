## Myspace Retrieval Intelligence

### Goal

Myspace should work like a student memory engine.

It should retrieve useful content when the student searches by:

- direct title text
- subject name
- OCR text from images
- context words like `blackboard`
- source words like `screenshot`
- date memory like `today` or `yesterday`
- concept words like `math` even if the saved card says `P&S`

### Inputs

- query string
- saved item title
- body
- subject
- tags
- source
- date label
- OCR text

### Ranking Strategy

The ranking should combine several signals:

1. Exact or near-exact title match
2. Subject alias match
3. OCR text match
4. Tag match
5. Source match
6. Date memory match
7. Context alias match

### Alias Layer

The retrieval layer should maintain:

- subject aliases
  - `math` -> `P&S`
  - `database` -> `DBMS`
- context aliases
  - `board` -> `blackboard`
  - `photo` -> `image`
- study synonyms
  - `revision` -> `study`
  - `interview` -> `placement`

### Output Contract

Each result should include:

- score
- matched reasons
- strongest match type
- optional explanation string for UI

### Product Rules

- Results must remain deterministic and explainable.
- Empty queries should bias pinned and featured items.
- OCR matches should be strong but not always stronger than exact title matches.
- Subject aliases should help retrieval without hiding direct exact matches.

### Future Upgrade Path

This can later evolve into a hybrid retrieval layer:

- deterministic lexical scoring
- vector search on OCR and note embeddings
- personalized resurfacing
- temporal ranking based on class schedule proximity

## Implementation Reference

The current mobile-first indexing and retrieval pipeline is documented in:

- [docs/myspace-indexing-pipeline.md](/Users/sahilkumarsingh/Desktop/SENTRI/docs/myspace-indexing-pipeline.md)

That document maps the actual implementation in the Expo app to the future backend sync path.
