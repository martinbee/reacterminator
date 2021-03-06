/* eslint-env mocha */
const fs = require('fs')
const shell = require('shelljs')
const assert = require('chai').assert
const reacterminator = require('../../lib/index')

describe('integration/file-input', function () {
  beforeEach(function () {
    shell.rm('-rf', './reacterminator')
  })

  it('should generate one file with one component', function () {
    reacterminator(
      {
        type: 'path',
        content: './examples/test/component-a.html'
      },
      {
        generateFiles: true
      }
    )

    const ComponentAActual = fs.readFileSync(
      './reacterminator/generated/components/ComponentA.jsx',
      'utf8'
    )

    const ComponentAExpected = `\
import React from 'react';
import custom from '../../custom/index';

class ComponentA extends React.Component {
  render() {
    return (
      <div>
      </div>
      );
  }
}
;

const customize = custom['components/ComponentA'] || ((x) => x);
const ComponentAWithCustom = customize(ComponentA, {
  React
});

export default ComponentAWithCustom;
`

    assert.deepEqual(ComponentAActual, ComponentAExpected)
  })

  it('should emit an error when the input type is not allowed', function () {
    assert.throws(
      function () {
        reacterminator(
          {
            type: 'non-exist',
            content: './examples/test/component-a.html'
          }
        )
      },
      /the input.type should be "path" or "string", not "non-exist"/
    )
  })

  it('should emit an error when the input path does not exist', function () {
    assert.throws(
      function () {
        reacterminator(
          {
            type: 'path',
            content: './not-exist'
          }
        )
      },
      /no such file or directory/
    )
  })

  it('should generate files for all the files in a folder non-recursivly', function () {
    assert.throws(function () { fs.statSync('./reacterminator/generated/components/ComponentA.jsx') })

    reacterminator(
      {
        type: 'path',
        content: './examples/test/'
      },
      {
        generateFiles: true
      }
    )

    assert(fs.statSync('./reacterminator/generated/components/ComponentA.jsx').isFile())
    assert.throws(function () { fs.statSync('./reacterminator/generated/components/SubFolder.jsx') })
  })

  it('should generate files for all the files in a folder recursivly', function () {
    assert.throws(function () { fs.statSync('./reacterminator/generated/components/SubFolder.jsx') })
    assert.throws(function () { fs.statSync('./reacterminator/generated/components/ComponentA.jsx') })

    reacterminator(
      {
        type: 'path',
        content: './examples/test'
      },
      {
        generateFiles: true,
        recursive: true
      }
    )

    assert(fs.statSync('./reacterminator/generated/components/SubFolder.jsx').isFile())
    assert(fs.statSync('./reacterminator/generated/components/ComponentA.jsx').isFile())
  })

  it('should throw an error when the input file is not a file or directory', function () {
    assert.throws(function () {
      reacterminator(
        {
          type: 'path',
          content: '/dev/null'
        }
      )
    }, /is not a file or directory/)
  })
})
