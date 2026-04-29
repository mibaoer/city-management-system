import React, { useState } from "react";

interface TestProps {}

const TestComponent: React.FC<TestProps> = () => {
    const [activeTab, setActiveTab] = useState<string>('tasks');
    
    return (
        <div>
            <h1>Test Component</h1>
            <p>Active Tab: {activeTab}</p>
        </div>
    );
};

export default TestComponent;