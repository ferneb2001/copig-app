procedure xpru1
* agrega a¤o 1995 al archivo mail para incluirlo en el indice
clear
set talk off
set date to french
set deleted on
wconta=0
select 1
use mail
do while not eof()
  replace ano with 1995
  wconta=wconta+1
  @20,20 say wconta
  skip
enddo
close all
clear
@10,01 say 'ya termino la corrida'
return
