import React, { useState } from 'react';
import { rolePlayScenarios } from '../data/rolePlayScenarios';
import RolePlaySession from '../components/RolePlaySession';
import '../components/RolePlaySession.css';

const RolePlayMode = () => {
    const [selectedScenario, setSelectedScenario] = useState(null);

    if (selectedScenario) {
        return <RolePlaySession scenario={selectedScenario} onExit={() => setSelectedScenario(null)} />;
    }

    return (
        <div className="path-page animate-fade-in">
            <div className="section-header" style={{ marginBottom: '1.5rem' }}>
                <h2>실전 롤플레이 🎭</h2>
                <p>상황극을 통해 영어를 마스터하세요!</p>
            </div>

            <div className="scenarios-list">
                {rolePlayScenarios.map((scenario) => (
                    <div
                        key={scenario.id}
                        className="card"
                        style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'transform 0.2s' }}
                        onClick={() => setSelectedScenario(scenario)}
                    >
                        <div style={{ fontSize: '2rem' }}>{scenario.emoji}</div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{scenario.title}</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{scenario.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RolePlayMode;
