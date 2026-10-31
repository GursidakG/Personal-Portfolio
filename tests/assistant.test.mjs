import { test } from 'node:test';
import assert from 'node:assert/strict';
import assistant from '../assistant.js';

const { tokenize, answer, suggestions, KNOWLEDGE } = assistant;

test('tokenize lowercases, drops stopwords and stems plurals and verb forms', () => {
  const tokens = tokenize("Where did you STUDY, and what are your Studies?");
  assert.ok(tokens.includes('study'));
  assert.ok(!tokens.includes('where'));
  assert.ok(!tokens.includes('you'));
  assert.equal(tokens.filter(t => t === 'study').length, 2);
});

test('tokenize keeps technology names that contain punctuation', () => {
  const tokens = tokenize('Do you know C++ or Node.js?');
  assert.ok(tokens.includes('cpp'));
  assert.ok(tokens.includes('nodejs'));
});

test('knowledge entries are well formed with unique ids', () => {
  const ids = new Set();
  for (const entry of KNOWLEDGE) {
    assert.ok(entry.id && !ids.has(entry.id), `duplicate or missing id: ${entry.id}`);
    ids.add(entry.id);
    assert.ok(typeof entry.answer === 'string' && entry.answer.length > 20, `${entry.id} needs an answer`);
    assert.ok(Object.keys(entry.keys).length > 0, `${entry.id} needs keys`);
    assert.ok(!/<[a-z]/i.test(entry.answer), `${entry.id} answer must be plain text`);
  }
});

const routes = [
  ['Where do you go to school?', 'education'],
  ['What are you studying?', 'education'],
  ['Tell me about SensTek', 'senstek'],
  ['What do you do at your internship?', 'senstek'],
  ['What is AIVAA?', 'redstone'],
  ['What is Redstone Automations?', 'redstone'],
  ['Tell me about your company', 'redstone'],
  ['Do you want to work at NVIDIA?', 'nvidia'],
  ['Where do you see yourself in five years?', 'nvidia'],
  ['What are you working on right now?', 'now'],
  ['Which projects are you proudest of?', 'projects'],
  ['Where did you go to high school?', 'leadership'],
  ['What projects have you built?', 'projects'],
  ['Tell me about the chess engine', 'chess'],
  ['What is NoteVis?', 'notevis'],
  ['What languages do you code in?', 'skills'],
  ['What is your tech stack?', 'skills'],
  ['What languages do you speak?', 'spoken-languages'],
  ['How can I contact you?', 'contact'],
  ['Can I see your resume?', 'resume'],
  ['Where are you based?', 'location'],
  ['What do you do for fun?', 'interests'],
  ['Any awards or competitions?', 'achievements'],
  ['Tell me about YorkU CS Hub', 'leadership'],
  ['What did you do at Nutritionwize?', 'nutritionwize'],
  ['hello', 'greeting'],
  ['thanks!', 'thanks'],
  ['What is this hologram?', 'about-assistant'],
  ['Are you open to internships?', 'availability'],
  ['Why should we hire you?', 'why-hire'],
  ['How old are you?', 'personal'],
];

for (const [question, expected] of routes) {
  test(`routes "${question}" to ${expected}`, () => {
    assert.equal(answer(question).id, expected);
  });
}

test('the AIVAA question explains the rename', () => {
  const result = answer('What is AIVAA?');
  assert.match(result.text, /Redstone Automations/);
  assert.match(result.text, /AIVAA/);
});

test('contact answer carries a mailto link and the contact section', () => {
  const result = answer('How do I email you?');
  assert.ok(result.links.some(link => link.href.startsWith('mailto:gursidakg123@gmail.com')));
  assert.ok(result.links.some(link => link.href === '#contact'));
});

test('unknown questions fall back with suggestions and say so honestly', () => {
  const result = answer('What is the weather on Mars today?');
  assert.equal(result.id, 'fallback');
  assert.equal(result.matched, false);
  assert.ok(result.suggestions.length >= 3);
  assert.match(result.text, /don't have|not on this page|can't answer/i);
});

test('empty input falls back without throwing', () => {
  assert.equal(answer('').id, 'fallback');
  assert.equal(answer('   ').id, 'fallback');
  assert.equal(answer(undefined).id, 'fallback');
});

test('every answer offers follow-up suggestions', () => {
  for (const [question] of routes) {
    const result = answer(question);
    assert.ok(Array.isArray(result.suggestions) && result.suggestions.length >= 2, `${question} lacks suggestions`);
  }
});

test('starter suggestions are a short list of real questions', () => {
  const starters = suggestions();
  assert.ok(starters.length >= 3 && starters.length <= 6);
  for (const starter of starters) assert.ok(/\?$/.test(starter), `${starter} should be a question`);
});

test('a greeting prefix does not hijack a real question', () => {
  assert.equal(answer('hi, what is your email?').id, 'contact');
  assert.equal(answer('hello, how can I contact you?').id, 'contact');
  assert.equal(answer('thanks! what is your email').id, 'contact');
  assert.equal(answer('hey there').id, 'greeting');
});

const starterRoutes = {
  'What are you working on right now?': 'now',
  'What is Redstone Automations?': 'redstone',
  'Which projects are you proudest of?': 'projects',
  'Where do you want to work one day?': 'nvidia',
  'How can I get in touch?': 'contact',
};

test('every starter question routes to its intended entry', () => {
  for (const starter of suggestions()) {
    assert.ok(starter in starterRoutes, `${starter} has no expected route`);
    assert.equal(answer(starter).id, starterRoutes[starter], starter);
  }
});

test('every follow-up question gets a real answer from a different entry', () => {
  for (const entry of KNOWLEDGE) {
    for (const question of entry.follow) {
      const result = answer(question);
      assert.ok(result.matched, `${question} fell back`);
      assert.notEqual(result.id, entry.id, `${entry.id} suggests itself with "${question}"`);
    }
  }
});

test('NoteVis answer links to the Chrome Web Store listing', () => {
  const result = answer('What is NoteVis?');
  assert.ok(result.links.some(link => link.href.startsWith('https://chromewebstore.google.com/detail/notevis/iocjnepieopkfcmheegkoccpkdjdnlmi')));
});

test('chess answer links to the repository, not just the profile', () => {
  const result = answer('Tell me about the chess engine');
  assert.ok(result.links.some(link => link.href === 'https://github.com/GursidakG/Chess'));
});

test('availability answer names the Summer 2027 internship search', () => {
  assert.match(answer('Are you open to internships?').text, /Summer 2027/);
  assert.match(answer('Who are you?').text, /Summer 2027/);
});

test('Redstone answer carries the website, the start date and the customer count', () => {
  const result = answer('What is Redstone Automations?');
  assert.ok(result.links.some(link => link.href === 'https://redstoneautomations.si'));
  assert.match(result.text, /February 2026/);
  assert.match(result.text, /15 active customers/);
});

test('achievements mention the AWS certification in progress', () => {
  assert.match(answer('Any certifications?').text, /AWS Certified Cloud Practitioner/);
});

test('GitHub question lists the smaller repositories too', () => {
  const result = answer("What's on your GitHub?");
  assert.equal(result.id, 'projects');
  assert.match(result.text, /Weather Dashboard/);
});
