import assert from 'node:assert/strict'

(globalThis as typeof globalThis & { DOMMatrix?: any }).DOMMatrix = class DOMMatrix {
  constructor(...args: unknown[]) {
    this.args = args
  }
}

const { mapParsedCvToFormState } = await import('../lib/cv-import.ts')

const parsed = {
  name: 'Amina Ben Ali',
  title: 'Développeuse Full Stack',
  email: 'amina@example.com',
  phone: '+216 55 123 456',
  location: 'Tunis, Tunisie',
  summary: 'Développeuse web avec expérience en React et Next.js.',
  experiences: [
    {
      position: 'Développeuse Frontend',
      company: 'TechNova',
      start: '2022',
      end: 'Présent',
      description: 'Développement de tableaux de bord et d’APIs internes.',
    },
  ],
  education: [
    {
      degree: 'Licence Informatique',
      school: 'Université de Tunis',
      year: '2021',
      grade: 'Très bien',
    },
  ],
  skills: ['React', 'TypeScript'],
  languages: ['Français', 'Anglais'],
  interests: ['Voyages', 'Lecture'],
}

const mapped = mapParsedCvToFormState(parsed)

assert.equal(mapped.profile.name, 'Amina Ben Ali')
assert.equal(mapped.profile.title, 'Développeuse Full Stack')
assert.equal(mapped.profile.email, 'amina@example.com')
assert.equal(mapped.profile.phone, '+216 55 123 456')
assert.equal(mapped.profile.location, 'Tunis, Tunisie')
assert.equal(mapped.experiences[0].position, 'Développeuse Frontend')
assert.equal(mapped.experiences[0].company, 'TechNova')
assert.equal(mapped.experiences[0].description, 'Développement de tableaux de bord et d’APIs internes.')
assert.deepEqual(mapped.skills, ['React', 'TypeScript'])
assert.deepEqual(mapped.languages, ['Français', 'Anglais'])
assert.deepEqual(mapped.interests, ['Voyages', 'Lecture'])

const mixed = {
  ...parsed,
  title: '+216 55 123 456',
  phone: 'TechNova',
  experiences: [
    {
      position: '2022',
      company: '08 123 456',
      start: '2021',
      end: '2024',
      description: 'Mission clé',
    },
  ],
}

const mixedMapped = mapParsedCvToFormState(mixed)
assert.equal(mixedMapped.profile.title, '')
assert.equal(mixedMapped.profile.phone, '')
assert.equal(mixedMapped.experiences[0].position, '')
assert.equal(mixedMapped.experiences[0].company, '')

console.log('CV import field mapping test passed')
