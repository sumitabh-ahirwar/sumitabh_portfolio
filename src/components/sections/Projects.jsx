import { useRef } from 'react';
import { projects } from '../../data/projects';
import { useSectionReveal } from '../../hooks/useSectionReveal';
import SectionHead from '../ui/SectionHead';
import ProjectCard from '../projects/ProjectCard';

export default function Projects({ onOpen }) {
  const ref = useRef(null);
  useSectionReveal(ref);
  return (
    <section className="section projects" id="projects" ref={ref} tabIndex={-1} aria-labelledby="projects-title">
      <div className="container">
        <SectionHead
          index="02"
          label="Selected work"
          id="projects-title"
          title="Three systems, built end to end."
          lede="Each is a different engineering problem: grounded AI research, training under tight memory limits, and a full-stack product with AI in the loop."
        />
        <div className="projects__list">
          {projects.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} onOpen={onOpen} />
          ))}
        </div>
      </div>
    </section>
  );
}
