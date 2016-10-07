#!/bin/bash
#Forks a new branch from master and pushes it to origin

declare -a SUPPORTED_RELEASE_TYPES=(
	"release" 
	"hotfix" 
    );


help() {
  echo "Usage: `basename $0` <type> <version number>"
  echo "    type: ${SUPPORTED_RELEASE_TYPES[@]} " #no freedom here
  echo "    version: semver, x.y.z"  #no freedom here either
  echo
  echo "    Example: to create a release branch called 1.9.0 (release/1.9.0) type "
  echo "            `basename $0` release 1.9.0"
  exit 2
}

#sets GIT_BRANCH to current branch 
find_git_branch() {
  # Based on: http://stackoverflow.com/a/13003854/170413
  local BRANCH
  if BRANCH=$(git rev-parse --abbrev-ref HEAD 2> /dev/null); then
    if [[ "$BRANCH" == "HEAD" ]]; then
      BRANCH='detached*'
    fi
    GIT_BRANCH="$BRANCH"
  else
    GIT_BRANCH=""
  fi
}


#sets GIT_DIRTY to y if local branch is dirty
find_GIT_DIRTY() {
  local status=$(git status --porcelain 2> /dev/null)
  if [[ "$status" != "" ]]; then
    GIT_DIRTY='y'
  else
    GIT_DIRTY='n'
  fi
}


#SANITY CHECKS

#Must be two parameters
if [ $# -ne 2 ]; then
 echo; echo  "Two parameters please" ; echo 	
 help
fi


#First parameter must be one of SUPPORTED_RELEASE_TYPES
for SUPPORTED_RELEASE_TYPE in "${SUPPORTED_RELEASE_TYPES[@]}"
do
	if [ $1 == $SUPPORTED_RELEASE_TYPE ]; then
 		BRANCH_TYPE=$1
	fi
done


if [ -z "$BRANCH_TYPE" ]; then
 echo; echo  "First parameter must be one of these: ${SUPPORTED_RELEASE_TYPES[@]}" ; echo 	
 help
fi

#Second parameter must be semver format: 1.2.3
#note - support hotifx versions and release candidates
VERSION=$2
SEMVER_REGEX="^([1-9]+)\.([1-9]+)\.([1-9]+)$"
if ! [[ "$VERSION" =~ $SEMVER_REGEX ]]; then
 echo "Version \"$VERSION\" does not match SEMVER_REGEX"
 exit -6
fi


BASE_BRANCH=master

find_git_branch
echo "You are currently on branch ${GIT_BRANCH}"

if [ $GIT_BRANCH != $BASE_BRANCH ]; then
 echo; echo  "Please checkout ${BASE_BRANCH} first and rerun `basename $0`" ; echo
 echo "Run: git checkout master; git fetch;" 	
 exit -4;
fi


find_GIT_DIRTY
#echo "GIT dirty: " ${GIT_DIRTY}
if [ $GIT_DIRTY = "yr" ]; then
 echo; echo  "Clean up git repo, branch \"${BASE_BRANCH}\" is dirty" ; echo
 echo "Run:  git stash" 	
 exit -5;
fi


NEW_BRANCH=${BRANCH_TYPE}/${VERSION}

BOLD=$(tput bold)
NORMAL=$(tput sgr0)
WHITE=$(tput setaf 7)

echo
echo ${BOLD}Will fork branch $NEW_BRANCH from $BASE_BRANCH ${NORMAL}
echo
echo "Type \"y\" if agree"
read confirmation
case "$confirmation" in
 y|Y) echo ""
 ;;
 *) echo "Only Y/y accepted. Exiting" ; 
	exit -3;
	;;
esac


#will execute these in order
declare -a COMMANDS=(
	"git checkout -b ${NEW_BRANCH}" 
	"git push -u origin ${NEW_BRANCH}" 
	"git checkout ${NEW_BRANCH}" 
	"git status"
    );


#echo ${COMMANDS[@]}

for COMMAND in "${COMMANDS[@]}"
do
	echo - - - - - - - -; echo
	echo Executing ${BOLD}${WHITE}$COMMAND${NORMAL}
	$COMMAND
	RET=$?	
	#echo Return value $RET 
	if [ $RET -ne 0 ]; then
 		echo; echo  "Giving up. Something went wrong, Check messages above" ; echo 	
 	exit -6
	fi
done


