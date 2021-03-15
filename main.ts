import { app, BrowserWindow, ipcMain, screen } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as log from 'electron-log';
import * as path from 'path';
import * as url from 'url';
import { exec } from 'child_process';
import { sys } from 'ping';

class Item {

  title: string;
  hostname: string;
  username: string;
  online_status: boolean;
}

export class Main {

  args: string[];
  serve: boolean;
  items: Item[] = [];

  windows: BrowserWindow = undefined;

  constructor() {
    this.args = process.argv.slice(1);
    this.serve = this.args.some(value => value === '--serve');

    this.initIPCMainListener();
    this.initAutoUpdater();
  }

  createWindow() {
    const electronScreen = screen;
    const size = electronScreen.getPrimaryDisplay().workAreaSize;
  
    this.windows = new BrowserWindow({
      x: 0, y: 0, width: size.width / 4 * 3, height: size.height / 4 * 3,
      webPreferences: {
        nodeIntegration: true,
        allowRunningInsecureContent: (this.serve) ? true : false,
        contextIsolation: false,
        enableRemoteModule : true
      }
    });
  
    this.windows.removeMenu();
  
    if(this.serve) {
      this.windows.webContents.openDevTools();
  
      require('electron-reload')(__dirname, {
        electron: require(`${__dirname}/node_modules/electron`)
      });
    }

    this.windows.loadURL(this.serve ? 'http://localhost:4200' : url.format({ 
      pathname: path.join(__dirname, 'dist/index.html'), 
      protocol: 'file:', 
      slashes: true 
    }));
  
    this.windows.on('closed', () => this.windows = undefined);

    setTimeout(() => {
      this.checkWindowsTerminalIsInstalled();
      this.initPingTask();
    }, 1000);
  }

  private checkWindowsTerminalIsInstalled() {
    exec('where wt', (error, stdout, stderr) => {
      if(!(error)) return;
    
      this.windows.webContents.send('windows-terminal-not-found');
    });
  }

  private initPingTask() {
    setInterval(() => {
      this.items.forEach((item) => {
        sys.probe(item.hostname, (isAlive) => {
          this.windows.webContents.send('status', {
            hostname: item.hostname,
            isAlive: isAlive
          });
        });
      });
    }, 1000 * 10);
  }

  private initIPCMainListener() {
    ipcMain.on('items', (event, args) => {
      this.items = args;
    });

    ipcMain.on('open-terminal', (event, args) => {
      const cmd = args.console;
      const command = args.command;
      const port = (command.includes(':') ? command.split(':')[1] : 22);

      if(cmd === 'Powershell' || cmd === 'Git Bash' ||  cmd === 'CMD') {
        const program = (cmd === 'Powershell' ? 'powershell' : cmd === 'CMD' ? 'cmd' : 'bash');
        const parameter = (cmd === 'Powershell' ? '-command' : cmd === 'CMD' ? '/k' : '-c');
        
        exec(`start ${program} ${parameter} "ssh ${command} -p ${port}"`, (error, stdout, stderr) => {
          if(error) console.log(error);
        });
      }
      if(cmd === 'Windows Terminal') {
        exec(`wt new-tab -d "%cd%" -p "PowerShell" ssh ${command} -p ${port}`, (error, stdout, stderr) => {
          if(error) console.log(error);
        });
      }
      console.log(command);
    });
    
    ipcMain.on('open-terminals', (event, args) => {
      const cmd = args.console;
      const commands = args.commands;


      if(cmd === 'Powershell' || cmd === 'Git Bash' ||  cmd === 'CMD') {
        const program = (cmd === 'Powershell' ? 'powershell' : cmd === 'CMD' ? 'cmd' : 'bash');
        const parameter = (cmd === 'Powershell' ? '-command' : cmd === 'CMD' ? '/k' : '-c');

        commands.forEach((command: string) => {
          const port = (command.includes(':') ? command.split(':')[1] : 22);

          exec(`start ${program} ${parameter} "ssh ${command} -p ${port}"`, (error, stdout, stderr) => {
            if(error) console.log(error);
          });
        });
      }
      
      if(cmd === 'Windows Terminal') {
        const lines = [];
      
        commands.forEach((command: string) => {
          const port = (command.includes(':') ? command.split(':')[1] : 22);
          lines.push(`new-tab -d "%cd%" -p "PowerShell" ssh ${command} -p ${port}`);
        });
        
        exec(`wt ${lines.join(';')}`, (error, stdout, stderr) => {
          if(error) console.log(error);
        });
      }

      console.log(commands);
    });
  }

  private initAutoUpdater() {
    autoUpdater.on('checking-for-update', () => log.info('[Updater] Checking for update...'));

    autoUpdater.on('update-available', (info) => log.info('[Updater] Update available.'));

    autoUpdater.on('update-not-available', (info) => log.info('[Updater] Update not available.'));

    autoUpdater.on('error', (error) => log.info('[Updater] Error in auto-updater: ' + error.toString()));

    autoUpdater.on('download-progress', (progress) => log.info(`[Updater] Downloading... ${progress.percent}`));

    autoUpdater.on('update-downloaded', (info) => {
      log.info('[Updater] Update downloaded; will install now');
      autoUpdater.quitAndInstall();
    });

    autoUpdater.checkForUpdatesAndNotify();
  }
}


const main = new Main();

try {
  app.on('ready', () => setTimeout(() => main.createWindow(), 400));

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
      app.quit();
  });

  app.on('activate', () => {
    if (main.windows === null) 
      main.createWindow();
  });

} catch (e) {
  // Catch Error
  // throw e;
}