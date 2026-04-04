import { loadOpenCV } from '@opencvjs/web';
import fs from 'fs';

// Node can't run this easily without canvas package because we need `cv.imread`.
// We will write a playwright or puppeteer script, or just inject an evaluate script into index.html?
