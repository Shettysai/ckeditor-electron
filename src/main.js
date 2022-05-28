const { app, BrowserWindow, Menu, dialog, ipcMain } = require( 'electron' );

const url = require( 'url' );
const path = require( 'path' );
const fs = require( 'fs' );


const isDev = process.mainModule.filename.indexOf( 'app.asar' ) < 0;

let mainWindow = null;


if ( isDev ) {
	process.env[ 'ELECTRON_DISABLE_SECURITY_WARNINGS' ] = true;
}

/*
app.allowRendererProcessReuse = true;

*/
function fileExists( filePath ) {
	try {
		return fs.statSync( filePath ).isFile();
	} catch ( err ) {
		return false;
	}
}

function createWindow() {
	if ( process.platform === "win32" && process.argv.length >= 2 ) {
		let preFilePath = process.argv[ 1 ];
		
		let preNormalizedPath;
		
		if ( path.isAbsolute( preFilePath ) ) {
			preNormalizedPath = path.normalize( preFilePath );
		} else {
			/*
			preNormalizedPath = path.join( __dirname, preFilePath );
			*/
			preNormalizedPath = path.join( process.cwd(), preFilePath );
		}
		
		if ( fileExists( preNormalizedPath ) ) {
			prePathFile = preNormalizedPath;
		}
	}
	
	mainWindow = new BrowserWindow( {
		width: 1040,
		height: 826,
		webPreferences: {
			nodeIntegration: true,
			/*
			devTools: true,
			enableRemoteModule: true,
			*/
			webSecurity: false,
			contextIsolation: false
		}
	} );

	//  and load the index.html of the app.
	mainWindow.loadURL( url.format( {
		pathname: path.join( __dirname, './index.html' ),
		protocol: 'file:',
		slashes: true
	} ) );

	mainWindow.webContents.on( 'did-finish-load', () => {
		mainWindow.setTitle( "CKEditor Electron" );
	} );

	if ( isDev ) {
		//  Open the DevTools.
		/*
		BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
		*/
		mainWindow.webContents.openDevTools( { mode: 'detach' } );
	}
	mainWindow.menuBarVisible = false;
	
	mainWindow.on( 'close', ( e ) => {
		e.preventDefault();
		
		mainWindow.webContents.send( 'action', 'call-quit' );
	} );
	mainWindow.on( 'closed', () => mainWindow = null );
}

app.on( 'ready', createWindow );

app.on( 'window-all-closed', () => {
	if ( process.platform !== 'darwin' ) {
		app.quit();
	}
} );

app.on( 'activate', () => {
	if ( mainWindow === null ) {
		createWindow();
	}
} );