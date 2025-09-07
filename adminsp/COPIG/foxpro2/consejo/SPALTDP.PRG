procedure spaltdp
*Cuenta  profesionales por departamento
@04,01 clear to 23,78
@04,28 say 'CONTEO DE PROFESIONALES POR DEPARTAMENTO'
set talk off
select 3
set exclusive on
set safety off
use spestad 
zap
set exclusive off
whabi=' '
wop=1
wnomtit=space(35)
whabi=' '
wcatego='  '
wtitulo=space(3)
wnuind=0
set date to ymd
wfecha=date()
select 5
use spdpto order dpto  
do arma
@23,01 clear to 23,78
select 2
use spprof index spprof
select 1
use spmatri
go top
set clock on
wtot1=0
wtot2=0
wtot3=0
@14,21 to 16,57
@15,23 say 'Aguarde..,estoy armando un archivo' color n/w*
do while .not. eof()
   do armasu
   select 1
   skip
enddo
*@12,01 clear to 12,78       
@15,23 say '     Aguarde..,voy a ordenarlo   ' color n/w*
select 3
sort to spestads on numind 
do imprime
@04,01 clear to 23,78
close all
return

procedure imprime
wop=1
set date to dmy
@23,01 clear to 23,78
@15,23 say 'Verifique estado de la impresora  '
@23,34 get wop pict '@*H LP\<1;LP\<2;\<Salir'
read
if wop<>3
   @15,23 say '     En proceso de impresi¢n    '   
   select 4
   use spestads
   go top
   set console off
   set printer on
   set device to printer
   if wop=1
      set printer to 'LPT1'
   else
      set printer to 'LPT2'
   endif      
   ???chr(27)+chr(67)+chr(72)
*   ???chr(27)+chr(48)
*   ???chr(27)+chr(15)
   wlin=90
   whoja=0
   winscri=0
   whabili=0
   wcarne=0
   wfallec=0
   wsena=0
   do while .not. eof()
      if wlin > 66
            do titulos
      endif
      if INSCRI <> 0
         if numind < 8
           do implin   
         else
            if numind < 13
               if wsena = 0
                  ? '    Total Zona Norte : '
                  ?? wcarne pict '99999' at 47
                  ?? wfallec pict '99999' at 63
                  wfallec=0
                  wcarne=0
                  wsena=1
                  wlin=wlin+1
               endif   
               do implin
            else
               if numind < 16
                  if wsena=1
                     ? '    Total Zona Este  : '
                     ?? wcarne pict '99999' at 47
                     ?? wfallec pict '99999' at 63
                     wfallec=0
                     wcarne=0
                     wsena=2
                     wlin=wlin+1
                  endif
                  do implin   
               else
                  if numind < 19
                     if wsena=2
                        ? '    Total Zona Centro: '
                        ?? wcarne pict '99999' at 47
                        ?? wfallec pict '99999' at 63
                        wfallec=0
                        wcarne=0
                        wsena=3
                        wlin=wlin+1
                     endif
                     do implin
                  endif      
               endif      
           endif
        endif            
      endif
      skip
   enddo
*   ???chr(27)+chr(18)
*    ???chr(27)+chr(50)
*    ???chr(27)+chr(80)
   if wsena = 3
       ? '    Total Zona Sur:    '
       ?? wcarne pict '99999' at 47
       ?? wfallec pict '99999' at 63
       wfallec=0
       wcarne=0
       wsena=4
       wlin=wlin+1
   endif    
   ?
   ?
   ? "      Totales:      "
   ?? winscri pict '99999' at 40
   ?? whabili pict '99999' at 56
*   ?? wcarne pict  '99999' at 60
*   ?? wfallec pict '99999' at 70
   eject
   set printer off
   set device to screen
   set safety on
endif   
@04,01 clear to 23,78
return

procedure implin
  ?nomtit 
  ??inscri pict '99999' at 40 
  ??habili pict '99999' at 56
  winscri= winscri+inscri
  whabili= whabili+habili
  wcarne = wcarne+inscri
  wfallec= wfallec+habili
  wlin=wlin+1
return

procedure titulos
whoja=whoja+1
IF WHOJA<> 1
if wlin > 66
   eject
endif
endif
? 'CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS - MENDOZA' 
?
?'CANTIDAD DE PROFESIONALES POR DEPARTAMENTO ' AT 20
?? 'Fecha: ' at 95
?? wfecha 
?? ' HOJA NRO. ' at 110
??whoja pict '999'
?
? '       DEPARTAMENTO                     INSCRIPTOS      HABILITADOS '
wlin = 5
return

procedure arma
do while .not. eof()
   wnuind=dpto   
   wnomtit=nombre 
   wtitulo=str(dpto,3)
   if prov = 0 or prov = 1
      select 3
      append blank
      replace numind  with wnuind
      replace codtit with wtitulo
      replace nomtit with wnomtit
      replace inscri with 0
      replace habili with 0
      replace carnde  with 0
      replace fallec with 0
   endif   
   select 5
   skip
enddo
select 3
use spestad
index on numind to spestai
return

procedure armasu
@10,10 say numero
@10,15 say catego
@10,20 say titulo
wnumind=0
whabili=0
wcarne=0
wfallec=0
if condic < '3'
  wkey1=str(dctipo,1)+str(dcnro,8)
  select 2
  seek(wkey1)
  if found()
     @10,1 say nombre
     @10,50 say provin
     @10,55 say dpto
     if provin < 2
        wnumind=dpto
        wtot1=wtot1+1
        winscri=1
        if a.habili < 1992
           whabili=0
           @10,60 say 'No Habilitado'
        else
           if a.habili > 1991 .and. a.condic < '2' 
              whabili=1
              wtot2=wtot2+1
            @11,60 say ' Habilitado'  
           endif
        endif
        @12,10 say ' Inscriptos leidos : '
        @13,10 say ' Habilitados leidos: '
        @12,40 say wtot1
        @13,40 say wtot2   
        select 3
        use spestad index spestai
        seek(wnumind)
        if found()
           wtot3=wtot3+1
           @14,10 say ' grabados : '
           @14,40 say wtot3
           replace inscri with inscri+winscri
           replace habili with habili+whabili
        endif
     endif
  endif      
endif   
return            