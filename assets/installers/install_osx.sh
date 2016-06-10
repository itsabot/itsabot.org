#!/bin/sh

source cmd/helper_functions.sh

sudo -k

printf "\n* [starting]"
printf " ***********************************************************\n\n"

put "this script will request sudo permissions to install dependencies."
put "you will be prompted for your password"

run "installing homebrew" "/usr/bin/ruby -e \$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)" "failed to install homebrew"
run "updating homebrew" "brew update" "failed to update homebrew"

run_chk "installing git" "brew install git" "failed to install git"
run_chk "installing go" "brew install go --cross-compile-common" "failed to install go"
run_chk "installing postgres" "brew install postgresql" "failed to install postgres"

mkdir -p ~/Library/LaunchAgents
cp -f /usr/local/opt/postgresql/*.plist ~/Library/LaunchAgents 2>/dev/null
sudo chmod 600 ~/Library/LaunchAgents/homebrew.mxcl.postgresql.plist
sudo chown root ~/Library/LaunchAgents/homebrew.mxcl.postgresql.plist

run_warn "setting postgres to start on boot" \
	"sudo launchctl load ~/Library/LaunchAgents/homebrew.mxcl.postgresql.plist" \
	"failed to set postgres to start on boot. if postgres is already configured to start on boot, you can ignore this message"
run_warn "creating postgres user" "createuser -d postgres" \
	"failed to create postgres user. if you already have a postgres user, you can ignore this message"
run_warn "creating postgres db" "initdb /usr/local/var/postgres -U postgres" \
	"failed to make db. if you already had postgres installed, you can ignore this message"
run_warn "starting postgres" "postgres -D /usr/local/var/postgres" "failed to start postgres. if postgres was already running, you can ignore this message"

touch "$HOME/.bashrc"
FILEPATH="$HOME/go"
if [ -z "$GOPATH" ]; then
	printf "Enter a path for your GOPATH (%s): " "$FILEPATH"
	read -r tempPath
	printf "\n"
	[ -n "$tempPath" ] && FILEPATH=$tempPath

	if [ ! -d "$FILEPATH"  ]; then
		 mkdir -p "$FILEPATH"
	fi
	echo "export GOPATH=$FILEPATH" >> "$HOME/.bashrc"
	GOPATH=$FILEPATH
fi

if [[ ":$PATH:" != *":$GOPATH/bin:"* ]]; then
	echo "export PATH=\$PATH:$GOPATH/bin" >> "$HOME/.bashrc"
fi

go get github.com/itsabot/abot
cd "$GOPATH/src/github.com/itsabot/abot" || exit
cmd/setup.sh postgres@127.0.0.1:5432

printf "\n* [finished]"
printf " ***********************************************************\n\n"

echo "to complete your setup:
    1. run 'source ~/.bashrc' in all open terminal windows
    2. run 'abot server'
    3. open a web browser to http://localhost:4200
    4. create an admin account on http://localhost:4200"
