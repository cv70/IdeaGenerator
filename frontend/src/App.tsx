import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type IdeaCard = {
  id: string
  name: string
  one_liner: string
  target_audience: string
  core_scenario: string
  value_point: string
  business_tags: string[]
  opportunity_tags: string[]
}

type OpportunityGroup = {
  cluster_id: string
  title: string
  ideas: IdeaCard[]
}

type GenerateIdeasData = {
  topic: string
  angle: string
  clusters: OpportunityGroup[]
}

type ApiResponse<T> = {
  code: number
  msg?: string
  data: T
}

const ANGLES = ['balanced', 'niche-first', 'profit-first', 'contrarian']

function App() {
  const [topic, setTopic] = useState('')
  const [angle, setAngle] = useState('balanced')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<GenerateIdeasData | null>(null)
  const [selectedTag, setSelectedTag] = useState('')
  const [favorites, setFavorites] = useState<Record<string, IdeaCard>>({})

  useEffect(() => {
    void loadFavorites()
  }, [])

  const allTags = useMemo(() => {
    if (!result) return []
    const tags = new Set<string>()
    for (const cluster of result.clusters) {
      for (const card of cluster.ideas) {
        card.business_tags.forEach((tag) => tags.add(tag))
        card.opportunity_tags.forEach((tag) => tags.add(tag))
      }
    }
    return Array.from(tags).sort()
  }, [result])

  const filteredClusters = useMemo(() => {
    if (!result) return []
    if (!selectedTag) return result.clusters
    return result.clusters
      .map((cluster) => ({
        ...cluster,
        ideas: cluster.ideas.filter(
          (idea) =>
            idea.business_tags.includes(selectedTag) || idea.opportunity_tags.includes(selectedTag),
        ),
      }))
      .filter((cluster) => cluster.ideas.length > 0)
  }, [result, selectedTag])

  async function generateIdeas(e?: FormEvent<HTMLFormElement>, nextAngle?: string) {
    e?.preventDefault()
    if (!topic.trim()) {
      setError('Please enter a topic first.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/v1/ideas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          count: 16,
          angle: nextAngle ?? angle,
        }),
      })

      const payload = (await response.json()) as ApiResponse<GenerateIdeasData>
      if (payload.code !== 200) {
        throw new Error(payload.msg || 'Failed to generate ideas')
      }

      setResult(payload.data)
      setSelectedTag('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  async function expandIdea(clusterId: string, card: IdeaCard) {
    try {
      const response = await fetch('/api/v1/ideas/expand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          base_idea_id: card.id,
          base_name: card.name,
          count: 5,
          angle,
        }),
      })
      const payload = (await response.json()) as ApiResponse<{
        topic: string
        base_idea_id: string
        base_name: string
        ideas: IdeaCard[]
      }>
      if (payload.code !== 200) {
        throw new Error(payload.msg || 'Failed to expand ideas')
      }

      setResult((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          clusters: prev.clusters.map((cluster) => {
            if (cluster.cluster_id !== clusterId) return cluster
            const existing = new Set(cluster.ideas.map((idea) => idea.id))
            const merged = [...cluster.ideas]
            payload.data.ideas.forEach((idea) => {
              if (!existing.has(idea.id)) merged.push(idea)
            })
            return { ...cluster, ideas: merged }
          }),
        }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  async function regenerateCluster(clusterId: string) {
    if (!topic.trim()) return
    try {
      const response = await fetch('/api/v1/ideas/regenerate-cluster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          cluster_id: clusterId,
          count: 6,
          angle,
        }),
      })
      const payload = (await response.json()) as ApiResponse<{
        topic: string
        cluster_id: string
        title: string
        ideas: IdeaCard[]
      }>
      if (payload.code !== 200) {
        throw new Error(payload.msg || 'Failed to regenerate cluster')
      }
      setResult((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          clusters: prev.clusters.map((cluster) =>
            cluster.cluster_id === payload.data.cluster_id
              ? { ...cluster, title: payload.data.title || cluster.title, ideas: payload.data.ideas }
              : cluster,
          ),
        }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  async function loadFavorites() {
    try {
      const response = await fetch('/api/v1/ideas/favorites')
      const payload = (await response.json()) as ApiResponse<{ ideas: IdeaCard[] }>
      if (payload.code !== 200) return
      const next: Record<string, IdeaCard> = {}
      payload.data.ideas.forEach((item) => {
        next[item.id] = item
      })
      setFavorites(next)
    } catch {
      // keep UI usable without hard-failing on load
    }
  }

  async function toggleFavorite(card: IdeaCard) {
    try {
      const favored = Boolean(favorites[card.id])
      if (favored) {
        const response = await fetch(`/api/v1/ideas/favorites/${card.id}`, { method: 'DELETE' })
        const payload = (await response.json()) as ApiResponse<Record<string, boolean>>
        if (payload.code !== 200) {
          throw new Error(payload.msg || 'Failed to remove favorite')
        }
        setFavorites((prev) => {
          const copy = { ...prev }
          delete copy[card.id]
          return copy
        })
        return
      }

      const response = await fetch('/api/v1/ideas/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card }),
      })
      const payload = (await response.json()) as ApiResponse<Record<string, boolean>>
      if (payload.code !== 200) {
        throw new Error(payload.msg || 'Failed to save favorite')
      }
      setFavorites((prev) => ({ ...prev, [card.id]: card }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  return (
    <div className="page">
      <header className="hero">
        <p className="badge">Opportunity Scanner</p>
        <h1>Generate business-flavored ideas from one topic.</h1>
        <p className="sub">
          Enter a topic, pick a generation angle, and get clustered cards you can filter and save.
        </p>
      </header>

      <section className="panel">
        <form className="form" onSubmit={generateIdeas}>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Try: pet economy, creator tools, AI education"
            className="topicInput"
          />
          <select value={angle} onChange={(e) => setAngle(e.target.value)} className="angleSelect">
            {ANGLES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button disabled={loading} type="submit" className="primary">
            {loading ? 'Scanning...' : 'Generate Ideas'}
          </button>
        </form>
        {error ? <p className="error">{error}</p> : null}
      </section>

      {result ? (
        <section className="resultWrap">
          <div className="resultHeader">
            <div>
              <h2>{result.topic}</h2>
              <p>Angle: {result.angle}</p>
            </div>
            <button
              type="button"
              onClick={() => generateIdeas(undefined, ANGLES[(ANGLES.indexOf(angle) + 1) % ANGLES.length])}
              className="ghost"
            >
              Change Angle
            </button>
          </div>

          <div className="tagRow">
            <button className={selectedTag === '' ? 'tag active' : 'tag'} onClick={() => setSelectedTag('')}>
              all
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                className={selectedTag === tag ? 'tag active' : 'tag'}
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="clusters">
            {filteredClusters.map((cluster) => (
              <article key={cluster.cluster_id} className="cluster">
                <div className="clusterHead">
                  <h3>{cluster.title}</h3>
                  <button type="button" className="mini" onClick={() => regenerateCluster(cluster.cluster_id)}>
                    Refresh Cluster
                  </button>
                </div>
                <div className="cards">
                  {cluster.ideas.map((idea) => {
                    const favored = Boolean(favorites[idea.id])
                    return (
                      <section key={idea.id} className="ideaCard">
                        <div className="ideaHead">
                          <h4>{idea.name}</h4>
                          <button type="button" className="mini" onClick={() => toggleFavorite(idea)}>
                            {favored ? 'Unsave' : 'Save'}
                          </button>
                          <button type="button" className="mini" onClick={() => expandIdea(cluster.cluster_id, idea)}>
                            Expand +5
                          </button>
                        </div>
                        <p>{idea.one_liner}</p>
                        <dl>
                          <dt>Audience</dt>
                          <dd>{idea.target_audience}</dd>
                          <dt>Scenario</dt>
                          <dd>{idea.core_scenario}</dd>
                          <dt>Value</dt>
                          <dd>{idea.value_point}</dd>
                        </dl>
                        <div className="chipRow">
                          {idea.business_tags.map((tag) => (
                            <span key={`b-${idea.id}-${tag}`} className="chip business">
                              {tag}
                            </span>
                          ))}
                          {idea.opportunity_tags.map((tag) => (
                            <span key={`o-${idea.id}-${tag}`} className="chip opportunity">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </section>
                    )
                  })}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <aside className="favorites">
        <h3>Saved Ideas ({Object.keys(favorites).length})</h3>
        <div className="savedList">
          {Object.values(favorites).length === 0 ? (
            <p className="empty">No saved ideas yet.</p>
          ) : (
            Object.values(favorites).map((idea) => (
              <article key={`saved-${idea.id}`} className="savedItem">
                <h4>{idea.name}</h4>
                <p>{idea.one_liner}</p>
                <button type="button" className="mini" onClick={() => toggleFavorite(idea)}>
                  Unsave
                </button>
              </article>
            ))
          )}
        </div>
      </aside>
    </div>
  )
}

export default App
