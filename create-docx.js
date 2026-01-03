const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const outputPath = 'C:/Projects/CV Builder/test-resume-proper.docx';
const output = fs.createWriteStream(outputPath);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log('DOCX created successfully:', archive.pointer(), 'bytes');
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);

// [Content_Types].xml
const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

// _rels/.rels
const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

// word/document.xml with resume content
const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>John Smith</w:t></w:r></w:p>
    <w:p><w:r><w:t>john.smith@email.com | (555) 123-4567 | San Francisco, CA</w:t></w:r></w:p>
    <w:p><w:r><w:t>linkedin.com/in/johnsmith | github.com/johnsmith</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p><w:r><w:t>SUMMARY</w:t></w:r></w:p>
    <w:p><w:r><w:t>Senior Software Engineer with 8+ years of experience building scalable web applications. Expert in React, Node.js, and cloud technologies. Passionate about clean code and mentoring junior developers.</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p><w:r><w:t>EXPERIENCE</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p><w:r><w:t>Senior Software Engineer</w:t></w:r></w:p>
    <w:p><w:r><w:t>TechCorp Inc. - San Francisco, CA</w:t></w:r></w:p>
    <w:p><w:r><w:t>January 2020 - Present</w:t></w:r></w:p>
    <w:p><w:r><w:t>Led development of microservices architecture serving 10M+ daily users</w:t></w:r></w:p>
    <w:p><w:r><w:t>Reduced API response times by 60% through optimization and caching strategies</w:t></w:r></w:p>
    <w:p><w:r><w:t>Mentored team of 5 junior developers, improving team velocity by 40%</w:t></w:r></w:p>
    <w:p><w:r><w:t>Implemented CI/CD pipelines reducing deployment time from hours to minutes</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p><w:r><w:t>Software Engineer</w:t></w:r></w:p>
    <w:p><w:r><w:t>StartupXYZ - San Francisco, CA</w:t></w:r></w:p>
    <w:p><w:r><w:t>June 2016 - December 2019</w:t></w:r></w:p>
    <w:p><w:r><w:t>Built React-based dashboard used by 50,000+ enterprise customers</w:t></w:r></w:p>
    <w:p><w:r><w:t>Designed and implemented RESTful APIs handling 1M+ requests daily</w:t></w:r></w:p>
    <w:p><w:r><w:t>Migrated legacy monolith to microservices, improving system reliability to 99.9%</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p><w:r><w:t>EDUCATION</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p><w:r><w:t>Bachelor of Science in Computer Science</w:t></w:r></w:p>
    <w:p><w:r><w:t>University of California, Berkeley</w:t></w:r></w:p>
    <w:p><w:r><w:t>Graduated: May 2014</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p><w:r><w:t>SKILLS</w:t></w:r></w:p>
    <w:p><w:r><w:t>JavaScript, TypeScript, React, Node.js, Python, PostgreSQL, MongoDB, Redis, AWS, Docker, Kubernetes, Git, CI/CD, Agile, REST APIs, GraphQL</w:t></w:r></w:p>
  </w:body>
</w:document>`;

archive.append(contentTypes, { name: '[Content_Types].xml' });
archive.append(rels, { name: '_rels/.rels' });
archive.append(document, { name: 'word/document.xml' });

archive.finalize();
