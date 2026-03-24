const fs = require('fs');
const path = require('path');

const componentsDir = 'c:\\Users\\MOTIVATION\\Desktop\\Pranay\\NEWS\\tv19\\src\\pages\\components';

const filesToUpdate = [
    { dir: 'ENTERTAINMENT', file: 'EntertainmentPage.tsx', prefix: 'entertainment', label: 'Entertainment' },
    { dir: 'SPORTS', file: 'SportsPage.tsx', prefix: 'sports', label: 'Sports' },
    { dir: 'POLITICS', file: 'PoliticsPage.tsx', prefix: 'politics', label: 'Politics' },
    { dir: 'TECHNOLOGY', file: 'TechnologyPage.tsx', prefix: 'technology', label: 'Technology' },
    { dir: 'BUSINESS', file: 'BusinessPage.tsx', prefix: 'business', label: 'Business' }
];

for (const { dir, file, prefix, label } of filesToUpdate) {
    const filePath = path.join(componentsDir, dir, file);
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        continue;
    }

    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Add CSS import if not present
    if (!content.includes("import '../../../pages/css/topic_categories.css';")) {
        content = content.replace(
            /import '..\/..\/..\/pages\/css\/.+?\.css';/,
            match => `${match}\nimport '../../../pages/css/topic_categories.css';`
        );
    }

    // 2. Replace the HTML structure
    // We want to match from <div className="[PREFIX]-subnav-wrapper"> up to its closing </div>
    // Note: Some have scroll buttons, some don't. But they all close at the same indentation level '        </div>' (or '                </div>' for 4 spaces).
    // Let's use a regex that looks for the wrapper open and finds the matching closing tag.
    // A safe regex if we know there are no nested divs with the exact same suffix:
    const regex = new RegExp(`[ \\t]*<div className="${prefix}-subnav-wrapper">[\\s\\S]*?<\\/div>\\s*<\\/div>(?:\\s*<button[^>]+>.*?<\\/button>\\s*<\\/div>)?|[ \\t]*<div className="${prefix}-subnav-wrapper">[\\s\\S]*?<\\/div>\\s*<\\/div>`, 'm');
    
    // Actually, a simpler regex is just matching the block. 
    // In all cases, it's followed by `\n\n        <div className="${prefix}-content-grid">` (or 16 spaces).
    const blockRegex = new RegExp(`([ \\t]*)<div className="${prefix}-subnav-wrapper">[\\s\\S]*?(?=\\n\\s*<div className="${prefix}-content-grid">)`);
    
    const replacement = `$1<div className="tabs-scroll-wrap">
$1    <button className="tabs-arrow left" aria-label="Scroll left" onClick={() => scroll('left')}><UilAngleLeft /></button>
$1    <div className="tabs-scroll" id="tabsScroll" ref={scrollRef}>
$1        <ul className="nav nav-tabs" id="topicTabs" aria-label="${label} regions">
$1            {REGIONS.map((region) => (
$1                <li className="nav-item" key={region}>
$1                    <a
$1                        href="#0"
$1                        role="tab"
$1                        aria-selected={activeRegion === region}
$1                        className={\`nav-link \${activeRegion === region ? 'active' : ''}\`}
$1                        onClick={(e) => { e.preventDefault(); setActiveRegion(region); }}
$1                    >
$1                        {region}
$1                    </a>
$1                </li>
$1            ))}
$1        </ul>
$1    </div>
$1    <button className="tabs-arrow right" aria-label="Scroll right" onClick={() => scroll('right')}><UilAngleRight /></button>
$1</div>\n`;

    content = content.replace(blockRegex, replacement);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
}
