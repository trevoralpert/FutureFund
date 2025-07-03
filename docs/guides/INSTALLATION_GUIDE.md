# FutureFund Installation Guide
**Version 1.0** | **Setup & Configuration Instructions**

---

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation Options](#installation-options)
3. [Development Setup](#development-setup)
4. [Production Installation](#production-installation)
5. [Configuration](#configuration)
6. [First Launch](#first-launch)
7. [Troubleshooting](#troubleshooting)
8. [Updates & Maintenance](#updates--maintenance)

---

## 💻 System Requirements

### Minimum Requirements
- **Operating System**: macOS 10.15+, Windows 10+, or Linux (Ubuntu 18.04+)
- **RAM**: 4 GB minimum (8 GB recommended)
- **Storage**: 1 GB available space
- **Network**: Internet connection for AI features (OpenAI API)

### Recommended Requirements
- **Operating System**: macOS 12+, Windows 11+, or Linux (Ubuntu 20.04+)
- **RAM**: 8 GB or more
- **Storage**: 2 GB available space
- **CPU**: Multi-core processor for optimal AI performance
- **Network**: Stable broadband connection

### Software Dependencies
- **Node.js**: v18.0.0 or higher (for development)
- **npm**: v8.0.0 or higher (for development)
- **Git**: Latest version (for development)

---

## 🚀 Installation Options

### Option 1: Pre-built Application (Recommended)
**Best for**: End users who want to use FutureFund immediately

1. **Download** the latest release from GitHub releases
2. **Extract** the application archive
3. **Install** using your operating system's installer
4. **Launch** FutureFund from applications menu

### Option 2: Development Setup
**Best for**: Developers, customization, or contributing to the project

1. **Clone** the repository from GitHub
2. **Install** development dependencies
3. **Configure** environment variables
4. **Build** and run the application

---

## 🛠️ Development Setup

### Step 1: Clone Repository
```bash
# Clone the FutureFund repository
git clone https://github.com/yourusername/futurefund.git
cd futurefund

# Verify the clone
ls -la
```

### Step 2: Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Verify installation
npm list --depth=0
```

### Step 3: Environment Configuration
```bash
# Create environment file
cp environment.template .env

# Edit environment file (use your preferred editor)
nano .env
# or
code .env
```

### Step 4: Configure Environment Variables
Edit the `.env` file with your configuration:

```bash
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini

# LangChain Configuration
LANGCHAIN_API_KEY=your_langchain_api_key_here
LANGCHAIN_PROJECT=futurefund
LANGCHAIN_TRACING_V2=true
LANGCHAIN_ENDPOINT=https://api.langchain.com

# Application Configuration
NODE_ENV=development
DEBUG=true
LOG_LEVEL=info

# Database Configuration
DATABASE_PATH=./data/futurefund.db
DATABASE_BACKUP_ENABLED=true
```

### Step 5: Initialize Database
```bash
# Create and initialize the database
npm run db:init

# Verify database creation
ls -la data/
```

### Step 6: Start Development Server
```bash
# Start in development mode
npm run dev

# Alternative: Start in production mode
npm start
```

---

## 📦 Production Installation

### macOS Installation
```bash
# Download the macOS installer
curl -L https://github.com/yourusername/futurefund/releases/latest/download/FutureFund-mac.dmg -o FutureFund-mac.dmg

# Open the installer
open FutureFund-mac.dmg

# Drag FutureFund to Applications folder
# Launch from Applications
```

### Windows Installation
```bash
# Download the Windows installer
# Download FutureFund-win.exe from GitHub releases

# Run the installer
FutureFund-win.exe

# Follow the installation wizard
# Launch from Start Menu or Desktop
```

### Linux Installation (Ubuntu/Debian)
```bash
# Download the Debian package
wget https://github.com/yourusername/futurefund/releases/latest/download/FutureFund-linux.deb

# Install the package
sudo dpkg -i FutureFund-linux.deb

# Fix dependencies if needed
sudo apt-get install -f

# Launch from applications menu
futurefund
```

### Linux Installation (RPM-based)
```bash
# Download the RPM package
wget https://github.com/yourusername/futurefund/releases/latest/download/FutureFund-linux.rpm

# Install the package
sudo rpm -i FutureFund-linux.rpm

# Launch from applications menu
futurefund
```

### Linux Installation (AppImage)
```bash
# Download the AppImage
wget https://github.com/yourusername/futurefund/releases/latest/download/FutureFund-linux.AppImage

# Make it executable
chmod +x FutureFund-linux.AppImage

# Run the application
./FutureFund-linux.AppImage
```

---

## ⚙️ Configuration

### API Keys Setup

#### **OpenAI API Key**
1. **Visit**: https://platform.openai.com/
2. **Create Account**: Sign up or log in
3. **Navigate**: Go to API Keys section
4. **Generate**: Create a new secret key
5. **Copy**: Save the key securely
6. **Add to .env**: `OPENAI_API_KEY=your_key_here`

#### **LangChain API Key (Optional)**
1. **Visit**: https://langchain.com/
2. **Create Account**: Sign up or log in
3. **Navigate**: Go to API section
4. **Generate**: Create a new API key
5. **Copy**: Save the key securely
6. **Add to .env**: `LANGCHAIN_API_KEY=your_key_here`

### Database Configuration

#### **Default Configuration**
- **Database Type**: SQLite
- **Location**: `./data/futurefund.db`
- **Backup**: Automatic backup enabled
- **Migration**: Automatic schema migration

#### **Custom Database Location**
```bash
# In .env file
DATABASE_PATH=/custom/path/to/database.db
```

### Application Settings

#### **Development Mode**
```bash
# Enable development features
NODE_ENV=development
DEBUG=true
LOG_LEVEL=debug
```

#### **Production Mode**
```bash
# Enable production optimizations
NODE_ENV=production
DEBUG=false
LOG_LEVEL=info
```

---

## 🚀 First Launch

### Initial Setup Wizard
When you first launch FutureFund, you'll be guided through:

1. **Welcome Screen**: Introduction to FutureFund
2. **API Configuration**: Set up your OpenAI API key
3. **Sample Data**: Option to load sample transactions
4. **Guided Tour**: 6-step interactive tour
5. **Account Setup**: Create your first account

### Sample Data Loading
```bash
# Load sample transactions for testing
npm run db:seed

# Or through the UI
# Click "Load Sample Data" on first launch
```

### Verification Steps
1. **Check Database**: Verify database creation in `data/` folder
2. **Test AI Features**: Try asking a question in the AI Assistant
3. **Verify UI**: Ensure all tabs are accessible
4. **Check Performance**: Monitor console for errors

---

## 🔧 Troubleshooting

### Common Issues

#### **Issue: Application Won't Start**
```bash
# Check Node.js version
node --version  # Should be v18.0.0+

# Check npm version
npm --version   # Should be v8.0.0+

# Reinstall dependencies
rm -rf node_modules
npm install

# Try starting again
npm start
```

#### **Issue: Database Connection Error**
```bash
# Check database file permissions
ls -la data/futurefund.db

# Recreate database
rm data/futurefund.db
npm run db:init

# Check database path in .env
grep DATABASE_PATH .env
```

#### **Issue: AI Features Not Working**
```bash
# Check OpenAI API key
grep OPENAI_API_KEY .env

# Test API key
curl -H "Authorization: Bearer YOUR_API_KEY" https://api.openai.com/v1/models

# Check network connectivity
ping api.openai.com
```

#### **Issue: Performance Problems**
```bash
# Check memory usage
# In FutureFund, go to Help > Performance Monitor

# Clear cache
# In FutureFund, go to Help > Clear Cache

# Restart application
npm start
```

### System-Specific Issues

#### **macOS**
```bash
# Permission issues
xattr -d com.apple.quarantine FutureFund.app

# Gatekeeper issues
sudo spctl --master-disable  # Temporarily disable Gatekeeper
# Remember to re-enable: sudo spctl --master-enable
```

#### **Windows**
```bash
# Antivirus blocking
# Add FutureFund to antivirus exclusions

# PowerShell execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### **Linux**
```bash
# Missing dependencies
sudo apt-get install libgtk-3-0 libx11-xcb1 libxss1 libgconf-2-4

# Permission issues
chmod +x FutureFund-linux.AppImage
```

### Debug Mode
```bash
# Enable debug mode
NODE_ENV=development DEBUG=true npm start

# Check logs
tail -f ~/.config/FutureFund/logs/main.log
```

---

## 🔄 Updates & Maintenance

### Automatic Updates
FutureFund checks for updates automatically:
- **Check Frequency**: Weekly
- **Update Notification**: In-app notification
- **Auto-Download**: Latest version downloaded in background
- **Manual Install**: User chooses when to install

### Manual Updates

#### **Development Version**
```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm install

# Update database schema
npm run db:migrate

# Restart application
npm start
```

#### **Production Version**
1. **Download**: Latest release from GitHub
2. **Backup**: Export your data first
3. **Install**: Run the new installer
4. **Verify**: Check that data is preserved

### Database Maintenance

#### **Backup Database**
```bash
# Manual backup
cp data/futurefund.db data/futurefund-backup-$(date +%Y%m%d).db

# Automated backup (runs daily)
npm run db:backup
```

#### **Restore Database**
```bash
# Restore from backup
cp data/futurefund-backup-YYYYMMDD.db data/futurefund.db

# Restart application
npm start
```

#### **Database Migration**
```bash
# Run database migrations
npm run db:migrate

# Check migration status
npm run db:status
```

### Performance Maintenance

#### **Clear Cache**
```bash
# Clear application cache
rm -rf ~/.cache/FutureFund

# Clear npm cache (development)
npm cache clean --force
```

#### **Optimize Database**
```bash
# Optimize database
npm run db:optimize

# Vacuum database
npm run db:vacuum
```

---

## 📞 Getting Help

### Support Resources
- **User Manual**: Comprehensive usage guide
- **Developer Documentation**: Technical reference
- **Troubleshooting Guide**: Common issues and solutions
- **GitHub Issues**: Bug reports and feature requests

### Community Support
- **GitHub Discussions**: Community Q&A
- **Discord Server**: Real-time chat support
- **Email Support**: Technical support email

### Reporting Issues
When reporting issues, please include:
1. **Operating System**: Version and architecture
2. **FutureFund Version**: Found in Help > About
3. **Error Messages**: Full error text or screenshots
4. **Steps to Reproduce**: Detailed reproduction steps
5. **Log Files**: Relevant log file contents

---

## 📚 Additional Resources

### Documentation
- **User Manual**: Complete user guide
- **Developer Documentation**: Technical API reference
- **Feature Overview**: Business-focused feature summary
- **Troubleshooting Guide**: Extended troubleshooting information

### External Resources
- **Node.js**: https://nodejs.org/
- **Electron**: https://www.electronjs.org/
- **OpenAI API**: https://platform.openai.com/
- **LangChain**: https://langchain.com/

---

**✅ Congratulations! You've successfully installed FutureFund. You're now ready to take control of your financial future with AI-powered intelligence and forecasting.**

---

*FutureFund Installation Guide v1.0*  
*For additional support, refer to the User Manual and other documentation files.* 