procedure spacr
* Consulta de Repres. Tecnicos
set talk off
*clear
wsigue = 's'
wcontinua = 's'
wnumero=0
wcateg=space(2)
set exclusive off
wcatego=space(2)
wnom=space(30)
wnomem=space(55)
wkey=space(7)
wkey1=space(9)
wop=0
do while wcontinua = 's'
  * do while wsigue = "s"
      @07,20 say "Representantes T‚cnicos "
      @10,20 say "Por C¢digo Empresa          1 "
      @12,20 say "Por Matr¡cula Profesional   2 "
      @12,50 get wop pict "9"
      @23,01 say 'Indique la opci¢n elegida ¢ <ESC> para salir'
      read
      if lastkey() <> 27
         do case
            case wop = 1
               @14,20 say "Ingrese C¢digo de Empresa : "
               @14,50 get wnumero pict "99999"
               read
               if lastkey() <> 27
                  do buscart with wnumero
               else
                  wcontinua = 'n'
               endif   
            case wop = 2
               @14,20 say "Ingrese Matr¡cula Profesional: "
               @16,20 say "Ingrese Categor¡a            : "
               @14,50 get wnumero pict "99999"
               read
               if lastkey() <> 27
                  @16,50 get wcateg pict "!!"
                  read
                  do buscartp with wnumero, wcateg
               else
                  wcontinua = 'n'
               endif
         endcase      
      else
         wcontinua = 'n'
      endif
enddo
*wop1=1
@07,01 clear to 23,78 