import { useState } from 'react'
import '../App.css'

function Home() {
    const [message, setMessage] = useState('');

    return (
        <>
            <div>
                <h1>VibeChecker</h1>
                <h3>Enable more thoughtful and informed responses through real-time emotional intelligence tools.</h3>
            </div>
            <div style={{padding: 10,}}>
                
                <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                    style={{
                        width: '50%',
                        height: '250px',
                        background: '#222',
                        color: '#fff',
                        border: '1px solid #444',
                        borderRadius: '8px',
                        fontSize: '1.2rem',
                        padding: '16px',
                        marginTop: '24px',
                        resize: 'vertical',
                        boxSizing: 'border-box'
                    }}
                />
            </div>
        </>
    )
}

export default Home