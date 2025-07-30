    // Projects Screen
    import { Building,MapPin } from "lucide-react";
    export const ProjectsScreen = () => (
        <div style={{ height: '100vh', paddingBottom: '80px', overflowY: 'auto' }}>
            <div style={{
                padding: '20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                textAlign: 'center'
            }}>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Building size={24} />
                    New Projects
                </h2>
                <p style={{ margin: '5px 0 0', opacity: 0.9 }}>Upcoming Development Projects</p>
            </div>

            <div style={{ padding: '20px' }}>
                {[
                    { title: 'SO Tech Park Phase 2', location: 'Gachibowli', status: 'Planning', completion: '2026' },
                    { title: 'SO Residential Complex', location: 'Kondapur', status: 'In Progress', completion: '2025' },
                    { title: 'SO Commercial Hub', location: 'HITEC City', status: 'Approved', completion: '2027' }
                ].map((project, index) => (
                    <div key={index} style={{
                        backgroundColor: '#f8f9fa',
                        padding: '20px',
                        borderRadius: '12px',
                        marginBottom: '15px',
                        border: '1px solid #e9ecef'
                    }}>
                        <h3 style={{ margin: '0 0 10px', color: '#333' }}>{project.title}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <MapPin size={16} color="#666" />
                            <span style={{ color: '#666' }}>{project.location}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                            <span style={{
                                backgroundColor: project.status === 'In Progress' ? '#4CAF50' : '#FF9800',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '12px'
                            }}>
                                {project.status}
                            </span>
                            <span style={{ color: '#666' }}>Est. {project.completion}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );