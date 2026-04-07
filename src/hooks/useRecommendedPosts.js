import { useState, useEffect } from 'react'
import { getPublishedPosts } from '../lib/blogData.js'

const GAME_TAG_MAP = {
  fehlerDetektiv:       ['grammatik', 'rechtschreibung'],
  personenbeschreibung: ['schreiben', 'wortschatz'],
  diktat:               ['rechtschreibung', 'schreiben'],
  silbenPuzzle:         ['lesen', 'wortschatz'],
  buchstabenChaos:      ['lesen', 'buchstaben'],
  nomenFinder:          ['grammatik', 'nomen'],
  satzBuilder:          ['grammatik', 'schreiben'],
  farbenJaeger:         ['wortschatz', 'farben'],
  tierGeraeusche:       ['wortschatz', 'tiere'],
  memorySpiel:          ['gedächtnis', 'wortschatz'],
  wasFehlt:             ['konzentration', 'wortschatz'],
  falscherGegenstand:   ['konzentration', 'logik'],
  emotionenSpiel:       ['emotionen', 'sozial'],
  fahrzeugLenker:       ['wortschatz', 'fahrzeuge'],
  tierWissen:           ['wortschatz', 'tiere'],
  emojiGeschichte:      ['kreativität', 'schreiben'],
  emojiBaukasten:       ['kreativität', 'wortschatz'],
  emotionenKarten:      ['emotionen', 'sozial'],
  fruechtZaehlen:       ['mathe', 'zählen'],
  zahlenstrahl:         ['mathe', 'zahlen'],
  mehrWeniger:          ['mathe', 'vergleichen'],
  minusRakete:          ['mathe', 'rechnen'],
  zahlenfolge:          ['mathe', 'logik'],
  wuerfelRechnen:       ['mathe', 'rechnen'],
  miniMarkt:            ['mathe', 'alltag'],
  einmaleinsBlitz:      ['mathe', 'einmaleins'],
}

function scorePost(post, userTags, userAudiences) {
  let score = 0
  if (!userAudiences.includes(post.audience)) return -1
  const postTags = post.tags ?? []
  for (const tag of userTags) {
    if (postTags.includes(tag)) score += 2
  }
  return score
}

export function useRecommendedPosts(profile) {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    if (!profile) return
    getPublishedPosts(50).then(allPosts => {
      if (!allPosts.length) return

      const completed = profile.completedMissions ?? []
      const userTags = [...new Set(
        completed.flatMap(missionId => {
          const type = missionId.split('-')[0]
          return GAME_TAG_MAP[type] ?? []
        })
      )]

      const effectiveTags = userTags.length ? userTags : ['anfänger', 'onboarding', 'eltern']
      const userAudiences = ['alle', 'kinder', 'eltern']

      const scored = allPosts
        .map(p => ({ post: p, score: scorePost(p, effectiveTags, userAudiences) }))
        .filter(({ score }) => score >= 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 2)
        .map(({ post }) => post)

      setPosts(scored)
    }).catch(() => {})
  }, [profile?.uid, JSON.stringify(profile?.completedMissions)])

  return posts
}
