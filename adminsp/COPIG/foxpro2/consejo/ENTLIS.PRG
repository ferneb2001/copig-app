procedure entlis
* listado de Entidades Varias    
set talk off
@04,01 clear to 23,78
@04,25 say 'LISTADO DE ENTIDADES GREMIALES, OFICIALES, ETC.'
WOP2=0
@06,10 get wop2 pict '@*V \<Todas;\<Gobierno Provincial;Gobierno \<Nacional;\<Colegio-Consejos;/<Asociaciones Prof.;/<Empresas Varias;/<Revistas' size 1,1
read
wop=1
@23,30 get wop pict '@*H \<Salir;\<Imprimir' size 1,1
read
if wop=2
   set printer to lpt1
   set console off
   set printer on
   set device to printer
   use entidades order entnro
   fila = 1
   ??? CHR(15)
   do cabeza
   do while .not. eof()
      if fila > 66 
         eject
         do cabeza
         fila = 1
         loop
      endif
      ? entnro at 1
      ?? entcod at 7 pict '9'
      ?? entnombre at 09
      ?? entnomb2  at 40
      ?? entnomb3  at 71
      ?? ' '
      ?? enttipo  pict '99'
      ? ENTDIR1  at 15
      ?? entdir2 at 46
      ?? entpcia at 77
      ?? entpais at 88
      ??alltrim(enttel) at 99
      fila=fila+2
      skip
   enddo
   ???CHR(18)
   eject
   set device to screen
   set printer to
endif   
close all

procedure cabeza
? ' LISTADO DE ENTIDADES VARIAS' AT 12
? ' ---------------------------' AT 12
? ' '
? ' CODIGO    DESCRIPCION' AT 3
?
*?? 'COD.POSTAL PROVINCIA' AT 27
return   
   