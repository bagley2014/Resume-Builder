# Resume Builder

This app allows the user to define a family of resumes using JSON documents, then produce a resume from that family by defining it with a set of tags. 

There are two parts to the app. The parser takes the user generated JSON files and converts them to objects containing only the data specified by the tags, and the renderer takes data objects and converts them to HTML.

The parser takes objects that conform to the schema found at `./src/utils/schema.json`.